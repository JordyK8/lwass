# lwass
To start project clone into folder.

create a .env file and insert the following in this file:
```
PORT=3000
MONGO_URI="mongodb://root:rootpassword@mongodb_container:27017/test?authSource=admin"
AWS_ACCESS_KEY="admin"
AWS_ACCESS_SECRET="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
AWS_ENDPOINT="http://minio:9000"
```

* Make sure docker and docker-compose are installed on your device. More info: https://docs.docker.com/compose/install/

Inside the cloned repository folder run ```docker-compose build```.

If the following error occurs: 
  ```ERROR: gcloud failed to load: /tmp/_MEIDfZfsW/libssl.so.1.1: version `OPENSSL_1_1_1' not found (required by /usr/lib/python3.8/lib-dynload/_ssl.cpython-38-x86_64-linux-gnu.so)```? 
  Then run the following command in your terminal: ```export LD_LIBRARY_PATH=/usr/local/lib```, and try again docker-compose build.

Next run ```docker-compose up``` or  ```docker-compose up -d```(detatched) - to start project.

Api is then available on ```http://localhost:3000/api```
Form page is availbale on ```http://localhost:3000/api```
Minio server is available on ```http://lcoalhsot:9000```
MongoDB is reachable on ```mongodb://<username>:<password>@localhost:27017```
