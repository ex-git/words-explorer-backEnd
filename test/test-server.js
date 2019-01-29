const chai = require('chai');
 const chaiHttp = require('chai-http');

 const {app} = require('../server');

 const should = chai.should();
 chai.use(chaiHttp);

 describe('API', function() {

   it('should 401 on GET requests due to not auth', function() {
     return chai.request(app)
       .get('/api/words/food')
       .then(function(res) {
         res.should.have.status(401)
       });
   });
 });
