const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

suite("Functional Tests", function () {
  let putId;
  test("POST /api/issues/:project: Create an issue with every field", (done) => {
    let issue = {
      issue_title: "update error post",
      issue_text: "error post",
      created_by: "Funny",
      assigned_to: "Dana",
      status_text: "ok",
    };
    chai
      .request(server)
      .post("/api/issues/test")
      .send(issue)
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.issue_title, "update error post");
        assert.equal(res.body.issue_text, "error post");
        assert.equal(res.body.created_by, "Funny");
        assert.equal(res.body.assigned_to, "Dana");
        assert.equal(res.body.status_text, "ok");
        putId = res.body._id
        done();
      });
  });

  test("POST /api/issues/:project: Create an issue with only required fields", (done) => {
    let issue = {
      issue_title: "update error post",
      issue_text: "error post",
      created_by: "Dunny",
    };
    chai
      .request(server)
      .post("/api/issues/test")
      .send(issue)
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.issue_title, "update error post");
        assert.equal(res.body.issue_text, "error post");
        assert.equal(res.body.created_by, "Dunny");
        done();
      });
  });

  test("POST / api/issues/:project: Create an issue with missing required fields:", (done) => {
    let issue = {
      issue_title: "update error post",
      issue_text: "error post",
    };
    chai
      .request(server)
      .post("/api/issues/test")
      .send(issue)
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.text, '{"error":"required field(s) missing"}');
        done();
      });
  });

  //GET
  test("GET /api/issues/{project}: View issues on a project", (done) => {
    chai
      .request(server)
      .get("/api/issues/test")
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        done();
      });
  });

  test("GET /api/issues/{project}: View issues on a project with one filter", (done) => {
    chai
      .request(server)
      .get("/api/issues/test")
      .query({
        status_text: "ok"
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body[0].status_text, 'ok')
        done();
      });
  });

  test("GET /api/issues/{project}: View issues on a project with multiple filters", (done) => {
    chai
      .request(server)
      .get("/api/issues/test")
      .query({
        issue_text: "error post",
        created_by: 'Dunny'
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        assert.equal(res.body[0].created_by, "Dunny");
        assert.equal(res.body[0].issue_text, "error post");
        done();
      });
  });

  //PUT
  test("PUT /api/issues/{project}: Update one field on an issue", (done) => {
    chai
      .request(server)
      .put("/api/issues/test")
      .send({
        _id: putId,
        created_by: "Dunny",
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.result, "successfully updated");
        assert.equal(res.body._id, putId)
        done();
      });
  });

  test("PUT /api/issues/{project}: Update multiple fields on an issue", (done) => {
    chai
      .request(server)
      .put("/api/issues/test")
      .send({
        _id: putId,
        issue_title: "fixing error put",
        asigned_to: "Dunny",
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.result, "successfully updated");
         assert.equal(res.body._id, putId);
        done();
      });
  });

   test("PUT /api/issues/{project}: Update an issue with missing _id", (done) => {
     chai
       .request(server)
       .put("/api/issues/test")
       .send({
         issue_title: "fixing error put",
         asigned_to: "Dunny",
       })
       .end((err, res) => {
         assert.equal(res.status, 200);
         assert.equal(res.body.error, "missing _id");
         done();
       });
   });
  
  test("PUT /api/issues/{project}: Update an issue with no fields to update", (done) => {
    chai
      .request(server)
      .put("/api/issues/test")
      .send({
        _id: putId,
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, "no update field(s) sent");
        assert.equal(res.body._id, putId);
        done();
      });
  });

  test("PUT /api/issues/{project}: Update an issue with an invalid _id", (done) => {
    chai
      .request(server)
      .put("/api/issues/test")
      .send({
        _id: 12,
        asigned_to: "Dunny",
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, "could not update");
        assert.equal(res.body._id, 12)
        done();
      });
  });

  //DELETE
  test("DELETE /api/issues/{project}: Delete an issue", (done) => {
    chai
      .request(server)
      .delete("/api/issues/test")
      .send({
        _id: putId
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.result, "successfully deleted");
        assert.equal(res.body._id, putId);
        done();
      });
  });

   test("DELETE /api/issues/{project}: Delete an issue with an invalid _id", (done) => {
     chai
       .request(server)
       .delete("/api/issues/test")
       .send({ _id: 12 })
       .end((err, res) => {
         assert.equal(res.status, 200);
         assert.equal(res.body.error, "could not delete");
         assert.equal(res.body._id, 12)
         done();
       });
   });

  test("DELETE /api/issues/{project}: Delete an issue with missing _id", (done) => {
    chai
      .request(server)
      .delete("/api/issues/test")
      .send({})
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, "missing _id");
        done();
      });
  });
});
