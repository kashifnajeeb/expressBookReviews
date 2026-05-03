curl -s -c login.cookies -X POST http://localhost:4000/customer/login -H 'Content-Type: application/json' -d '{"username":"registeruser","password":"registerpass"}'

Output:
{"message":"User successfully logged in"}