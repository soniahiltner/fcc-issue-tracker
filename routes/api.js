"use strict";

const mongoose = require("mongoose");
const uri = process.env.MONGO_URI;
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const projectSchema = require("../models").projectSchema;

module.exports = function (app) {
  app
    .route("/api/issues/:project")

    .get(async function (req, res) {
      let project = req.params.project;
      let query = req.query;

      const Project = mongoose.model(project, projectSchema);
      try {
        const issues = await Project.find(query).select("-__v");
        res.json(issues);
      } catch (error) {
        console.log(error);
      }
    })

    .post(async function (req, res) {
      let project = req.params.project;

      const Project = mongoose.model(project, projectSchema);
      try {
        const newIssue = new Project(req.body)
        await newIssue.save()
        const issue = await Project.findById({ _id: newIssue._id }).select(
          "-__v"
        );
        res.json(issue);
      } catch (err) {
        console.log(err);
        res.send({ error: "required field(s) missing" });
      }
    })

    .put(async function (req, res) {
      let project = req.params.project;
      let id = req.body._id;

      const entries = Object.entries(req.body);
      const validEntries = entries.filter((el) => el[1] !== "");
      const validInput = Object.fromEntries(validEntries);
      validInput.updated_on = Date.now();

      const Project = mongoose.model(project, projectSchema);
      try {
        if (!id) {
          res.json({error:"missing _id"});
        } else {
          if (validEntries.length === 1) {
            res.json({ error: "no update field(s) sent", _id: id });
          } else if (validEntries.length > 1) {
            const issueToUpdate = await Project.findById({ _id: id });
            //if correct id
            if (issueToUpdate) {
              const issue = await Project.findOneAndUpdate(
                { _id: id },
                { $set: validInput },
                { new: true }
              );
              console.log(issue);
              res.json({ result: "successfully updated", _id: id });
            } else {
              //if no correct id
              res.json({ error: "could not update", _id: id });
            }
          }     
        }
      } catch (err) {
        console.log(err);
        res.json({ error: "could not update", _id: id });
      }
    })

    .delete(async function (req, res) {
      let project = req.params.project;
      const id = req.body._id;
      const Project = mongoose.model(project, projectSchema);
      try {
        if (!id) {
          res.json({ error: "missing _id" });
        } else {
          const issue = await Project.deleteOne({ _id: id });
          if (issue.deletedCount === 1) {
            res.json({ result: "successfully deleted", _id: id });
          } else {
            res.json({ error: "could not delete", _id: id });
          }
        }
      } catch (err) {
        console.log(err);
        res.json({ error: "could not delete", _id: id });
      }
    });
};
