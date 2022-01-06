# lwass
To start project clone into folder
Inside the cloned repository folder run ```docker-compose build```
If the following error occurs: 
  ```ERROR: gcloud failed to load: /tmp/_MEIDfZfsW/libssl.so.1.1: version `OPENSSL_1_1_1' not found (required by /usr/lib/python3.8/lib-dynload/_ssl.cpython-38-x86_64-linux-gnu.so)```
run the following command in your terminal: ```export LD_LIBRARY_PATH=/usr/local/lib```
Next run ```docker-compose up``` or  ```docker-compose up -d```(detatched) - to start project.
Api is then available on localhost:3000/api
Minio server is available on lcoalhsot:9000
MongoDB is reachable on mongodb://<username>:<password>@localhost:27017
