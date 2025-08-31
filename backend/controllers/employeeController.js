// employeeController.js
const Employee = require('../models/Employee');

exports.addEmployee = (req, res) => {
    const newEmployee = new Employee(req.body);
    newEmployee.save()
        .then(employee => res.status(201).json(employee))
        .catch(err => res.status(400).json({ error: err.message }));
};

exports.getEmployee = (req, res) => {
    Employee.findById(req.params.id)
        .then(employee => res.json(employee))
        .catch(err => res.status(404).json({ error: 'Employee not found' }));
};

exports.updateEmployee = (req, res) => {
    Employee.findByIdAndUpdate(req.params.id, req.body, { new: true })
        .then(employee => res.json(employee))
        .catch(err => res.status(400).json({ error: err.message }));
};
