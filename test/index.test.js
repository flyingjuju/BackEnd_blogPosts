const request = require('supertest');
const app = require('../server/index');

describe('GET root path',() => {

    it('it should reponse to tag query' , (done)=>{
        request(app)
        .get('/?tag=tech')
        .set('Accept','application/json')
        .expect('Content-type',/json/)
        .expect(200)
        .end((err,res)=>{
            if(err) return done(err);
            done();
        })
    })
});

describe('GET /api/ping',() => {

    it('it should send back status code and succeed message if successfully requested' , (done)=>{
        request(app)
        .get('/api/ping')
        .set('Accept','application/json')
        .expect('Content-type',/json/)
        .expect(200,{
            "success": true
        })
        .end((err,res)=>{
            if(err) return done(err);
            done();
        })
    })
})

describe('GET /api/posts',() => {

    it('it should reponse to a single tag query', (done)=>{
        request(app)
        .get('/api/posts?tags=tech')
        .set('Accept','application/json')
        .expect('Content-type',/json/)
        .expect(200)
        .end((err,res)=>{
            if(err) return done(err);
            done();
        })
    });

    it('it should reponse to multiple tags in a query', (done)=>{
        request(app)
        .get('/api/posts?tags=tech,science')
        .set('Accept','application/json')
        .expect('Content-type',/json/)
        .expect(200)
        .end((err,res)=>{
            if(err) return done(err);
            done();
        })
    });

    it('it should display error message if without tag query' , (done)=>{
        request(app)
        .get('/api/posts?tags=')
        .expect(400,{"error": "Tags parameter is required"})
        .end((err,res)=>{
            if(err) return done(err);
            done();
        })
    });

    it('it should display error message if sorting query is invalid' , (done)=>{
        request(app)
        .get('/api/posts?tags=tech&sortBy=tags')
        .expect(400,{"error": "sortBy parameter is invalid"})
        .end((err,res)=>{
            if(err) return done(err);
            done();
        })
    });

    it('it should display data with correct order if sorting query is valid' , (done)=>{
        request(app)
        .get('/api/posts?tags=tech&sortBy=id&direction=desc')
        .expect(200)
        .end((err,res)=>{
            if(err) return done(err);
            expect((res.body.posts[0].id - res.body.posts[res.body.posts.length-1].id)>0).toBeTruthy();           
            done();
        })
    })
})

