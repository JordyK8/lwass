const util = require('util');
const exec = util.promisify(require('child_process').exec);
const { encrypt } =  require('../lib/encryption');
const fs = require('fs').promises;
const Aws = require('../lib/aws');
const User = require('../lib/mongodb/models/User');
const { v4 } = require ('uuid');
const constants = require('../lib/constants/glob');

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
        const userExists = await this.models.User.find({email: encryptedEmail});
        // for production you want this. But I commented it out for testing purposes.
        // if(userExists) throw new Error("Email address has already been used.");
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

            const {stderr, stdout} = await exec(`ffmpeg -i ${videoFilePath} -ss ${constants.VIDEO_SCREENSHOT_TIME} -vframes 1 ${screenshotFilePath}`)
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