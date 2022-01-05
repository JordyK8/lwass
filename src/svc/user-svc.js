const util = require('util');
const exec = util.promisify(require('child_process').exec);
const { encrypt } =  require('../lib/encryption');
const fs = require('fs').promises;
const Aws = require('../lib/aws');
const User = require('../lib/mongodb/models/User');
const { v4 } = require ('uuid');

class UserService {
    constructor(){
        this.models = {
            User,
        }
        this.aws = new Aws();
    }

    /**
   * Creates user and saves the uploaded video and screenshot
   * @param {string} data.name Username
   * @param {string} data.email user email
   * @param {number} data.age user age
   * @param {File} file file containing buffer
   * @return {Object<User>}
   */
    async create(data) {
        UserService.validateFromData(data);
        const { file } = data;
        file.name = file.name.replace(/\s/g, '');
        const uuid = v4();
        try{
            const user = await this.createUser(data);

            const fileExtention = file.name.substring(file.name.lastIndexOf('.'), file.name.length);
            const uploadFileName = `${user._id}_${file.name}_${uuid}_${fileExtention}`;
            const upload = await this.aws.putObject("video-storage", file.data, uploadFileName);
            
            await this.takeScreenShot(file, user, uuid)
            
            user.video_file.name = file.name;
            user.video_file.ETag = upload.ETag;
            user.video_file.extension = file.name.substring(file.name.lastIndexOf('.'), file.name.length);
            
            await user.save();

            return user;
        } catch(e) {
            throw(e);
        }
    };
    
    /**
   * Creates user in DB
   * @param {string} data.name Username
   * @param {string} data.email user email
   * @param {number} data.age user age
   * @return {Promise<*>}
   */
    async createUser(data) {
        const encryptedName = await encrypt(data.name);
        const encryptedEmail = await encrypt(data.email);
        return this.models.User.create({name: encryptedName, email: encryptedEmail, age: data.age});
    };

    /**
   * Removes files in given path
   * @param {string[]} files array of filepaths
   * @return {Void<*>}
   */
    static cleanUpFiles(files) {
        for(const file of files) {
            fs.unlink(file)
        }
    };

    /**
   * Validates fromdata
   * @param {string} data.name Username
   * @param {string} data.email user email
   * @param {number} data.age user age
   * @param {File} file file containing buffer
   * @return {Object<*>} { valid: bool, msg: string }
   */
    static validateFromData(data) {
        let msg;
        let valid = true;
        const validateEmail = (email) => {
            return String(email)
              .toLowerCase()
              .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
              );
        };
        if(!data.age) msg = 'Missing age from submition form.'
        if(!data.name || data.name.length < 2) msg = "Name invalid, note that given name must be at least two characters long.";
        if(!data.email || !validateEmail(data.email)) msg = "Given emailaddress seems to be invalid.";
        if(!data.file) msg ='Missing videofile from submition form.';
        if(data.file && data.file.length > 1073741824) msg = 'File exceeds filesize limit of 1 Gb.';
        
        if (msg) return { valid: false, msg }
        return { valid }
    };

    /**
   * Generates and saves screenshot from video file and adds info to user
   * @param {File} file file containing buffer
   * @param {User} user user
   * @param {srtring} uuid unique uuid
   * @return {Object<ETag>} { ETag: string }
   */
    async takeScreenShot(file, user, uuid) {
        const fileExtention = file.name.substring(file.name.lastIndexOf('.'), file.name.length);
        const videoFilePath = `${__dirname}/../temp/videos/${uuid}_${file.name}`
        const screenshotFilePath = `${__dirname}/../temp/screenshots/${uuid}_${file.name.replace(fileExtention, '.jpg')}`
        try{
            await fs.writeFile(videoFilePath, file.data);

            const {stderr, stdout} = await exec(`ffmpeg -i ${videoFilePath} -ss 00:00:01 -vframes 1 ${screenshotFilePath}`)
            // Needs error handling but having some issues with getting the right output. File is created though
            if(stderr) console.log(stderr);
            
            const buffer = await fs.readFile(screenshotFilePath);
            const uploadFileName = `${user._id}_${file.name}_${uuid}${fileExtention}`
            const uploadScreenshot = await this.aws.putObject("screenshot-storage", buffer, uploadFileName);
            
            // I would prefer making this task and maybe more in here async,
            // and connect it to a messagebroker with a delay option to check temp folder for clutter.
            // For now this has to do.

            UserService.cleanUpFiles([videoFilePath, screenshotFilePath]); 

            user.video_screenshot.name = uploadFileName; 
            user.video_screenshot.extension = fileExtention;    
            user.video_screenshot.ETag = uploadScreenshot.ETag;    
            return uploadScreenshot;
        } catch(e) {
            UserService.cleanUpFiles([videoFilePath, screenshotFilePath]);
            throw(e);
        };
    };
};

module.exports = UserService;