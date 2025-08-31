// salaryController.js
const Salary = require('../models/Salary');

exports.updateSalary = (req, res) => {
    Salary.findByIdAndUpdate(req.params.id, req.body, { new: true })
        .then(salary => res.json(salary))
        .catch(err => res.status(400).json({ error: err.message }));
};

exports.getSalaryReport = (req, res) => {
    Salary.find({ employeeId: req.params.id })
        .then(report => res.json(report))
        .catch(err => res.status(404).json({ error: 'Salary report not found' }));
};
