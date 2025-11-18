# URLs:
- https://hkplace-serverapp.onrender.com/
- https://hkplace-serverapp.onrender.com/add/comment/Aberdeen

# CRUD Commands
- GET `curl "https://hkplace-serverapp.onrender.com/api/comment/Aberdeen"`
- POST `curl -X POST -d 'location=Stanley&content=Test657346' "https://hkplace-serverapp.onrender.com/api/add/comment/"`
- PUT `curl -X PUT -d 'content=Modified' "https://hkplace-serverapp.onrender.com/api/comment/Guest"`
- DELETE `curl -X DELETE "https://hkplace-serverapp.onrender.com/api/delete/comment/Guest"`
