const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a task title']
  },
  description: {
    type: String
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'in-progress', 'completed'],
      message: '{VALUE} is not a valid status'
    },
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  dueDate: {
    type: Date
  },
  projectId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Project',
    required: [true, 'A task must belong to one project']
  },
  assignedTo: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'A task must be assigned to one member']
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  comments: [
    {
      text: {
        type: String,
        required: true
      },
      user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

taskSchema.virtual('isOverdue').get(function() {
  if (!this.dueDate) return false;
  return this.dueDate < new Date() && this.status !== 'completed';
});

module.exports = mongoose.model('Task', taskSchema);
