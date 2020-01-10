const express = require("express");
const app = express();
const port = 3000;
const request = require('request');
const bodyParser = require('body-parser');

// bodyParser
app.use(bodyParser.json());

// root 
app.get('/', (req, res) => {
    const tag = req.query.tag;
    if(!tag){
        res.status(400).send({"error": "Tag parameter is required"});
        return next();
    } 
    request(`https://hatchways.io/api/assessment/blog/posts?tag=${tag}`, function(error, response, body) {
        if(error){
            console.log(error)
        }
        res.send(JSON.parse(body))
    });
  });


//routes
app.get('/api/ping', (req,res)=>{
    res.status(200).send({"success": true})
})

app.get('/api/posts', (req,res,next)=>{
    let tags = req.query.tags;
    let tagsArr = req.query.tags.split(',');

    // if tag query is not present, send error message
    if( tags.length<=1 || tagsArr.length < 1 ){
        res.status(400).send({"error": "Tags parameter is required"});
        return next();
    } 

    let sortBy = req.query.sortBy ||  'id';
    let direction = req.query.direction || 'asc';
    const sortableColumns = ['id', 'reads', 'likes', 'popularity'];
    const twoDirections =  ['asc','desc'];

    // if sorting query is not valid, send error message
    if(! sortableColumns.includes(sortBy) || !twoDirections.includes(direction)){
        res.status(400).send({"error": "sortBy parameter is invalid"});
        return next()
    }

    // request data
    const requestAsync = (url) => {
        return new Promise((resolve,reject)=>{
            const req = request(url,(err,response,body)=>{
                if(err){
                    return reject(err,response,body)
                }
                resolve(JSON.parse(body));
            })
        })
    }

    let urls = tagsArr.map((tag)=>{
        return `https://hatchways.io/api/assessment/blog/posts?tag=${tag}&sortBy=${sortBy}&direction=${direction}`
    })

    var getParallel = async function() {
        try {
            var data = await Promise.all(urls.map(url => requestAsync(url)));
        } catch (err) {
            console.error(err);
        }
        // remove duplicate data and modify data with correct sorting
        let dataObj = {};
        data.forEach(d=>{
            d.posts.forEach(post=>{
                let idNum = post.id
                if(!dataObj[idNum]){
                    dataObj[idNum] = post
                }
            })
        })
        let dataArr = Object.values(dataObj);
        if(dataArr.length>0){
            if(direction === 'asc'){
                dataArr.sort((a,b)=>{
                    return a[sortBy] - b[sortBy]
                })
            } else if (direction === 'desc'){
                dataArr.sort((a,b)=>{
                    return b[sortBy] - a[sortBy]
                })
            }
        }
        res.send({"posts":dataArr});
    }
    
    getParallel();
  
});

app.listen(port, () => {
 console.log("Server running on port 3000");
})

module.exports = app;
