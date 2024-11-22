tree -a -I 'node_modules|.git|.DS_Store'

 

docker exec -it 2016f29392ad ls -la /app/services/api/dist
s
docker exec -it 2016f29392ad find /app -name "app.controller.js"

docker-compose down

docker-compose up --build