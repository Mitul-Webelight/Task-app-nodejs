import Task from '../models/task.js';
import { constant, messages, statusCode } from '../util/messages.js';
import { successRes, errorRes } from '../util/response.js';
import dotenv from 'dotenv';
dotenv.config();

export const taskAdd = async (req, res) => {
  try {
    const { description, completed } = req.body;

    const task = new Task({
      description,
      completed,
      owner: req.user._id,
    });

    await task.save();
    successRes(res, task, statusCode.Created, messages.Created);
  } catch (error) {
    errorRes(res, statusCode.Internal_Server_Error, messages.Server_Error);
    console.error(error);
  }
};

export const allTaskList = async (req, res) => {
  try {
    const completed = req.query.completed;

    const filter = {};

    if (completed === 'true') {
      filter.completed = true;
    } else if (completed === 'false') {
      filter.completed = false;
    }

    const { limit, skip, sortBy: sort } = req.query;

    const task = await Task.find(filter)
      .limit(limit)
      .skip(skip)
      .sort(sort)
      .exec();

    successRes(res, task, statusCode.Ok, messages.Ok);
  } catch (error) {
    console.error(error);
    errorRes(res, statusCode.Internal_Server_Error, messages.Server_Error);
  }
};

export const taskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return errorRes(
        res,
        statusCode.Not_Found,
        messages.notFound(constant.task)
      );
    }
    successRes(res, task, statusCode.Ok, messages.Ok);
  } catch (error) {
    console.error(error);
    errorRes(res, statusCode.Internal_Server_Error, messages.Server_Error);
  }
};

export const taskUpdate = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id);

    if (!task) {
      return errorRes(
        res,
        statusCode.Not_Found,
        messages.notFound(constant.task)
      );
    }

    const { description, completed } = req.body;

    if (description || completed) {
      task.description = description;
      task.completed = completed;
    }

    await task.save();

    successRes(res, task, statusCode.Ok, messages.Ok);
  } catch (error) {
    console.error(error);
    errorRes(res, statusCode.Internal_Server_Error, messages.Server_Error);
  }
};

export const updateMultipleTasks = async (req, res) => {
  try {
    const { tasks } = req.body;

    if (!tasks) {
      return errorRes(
        res,
        statusCode.Not_Found,
        messages.notFound(constant.task)
      );
    }

    const updatedTasks = [];

    for (const taskData of tasks) {
      const task = await Task.findById(taskData.id);

      if (!task) {
        return errorRes(
          res,
          statusCode.Not_Found,
          messages.notFound(constant.task)
        );
      }

      if (taskData.description || taskData.completed ) {
        task.description = taskData.description;
        task.completed = taskData.completed;
      }

      // if (taskData.description !== undefined) {
      //   task.description = taskData.description;
      // }
      // if (taskData.completed !== undefined) {
      //   task.completed = taskData.completed;
      // }

      await task.save();
      updatedTasks.push(task);
    }
    successRes(res, updatedTasks, statusCode.Ok, messages.Ok);
  } catch (error) {
    console.error(error);
    errorRes(res, statusCode.Internal_Server_Error, messages.Server_Error);
  }
};

export const taskDelete = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return errorRes(
        res,
        statusCode.Not_Found,
        messages.notFound(constant.task)
      );
    }

    successRes(res, task, statusCode.Ok, messages.Ok);
  } catch (error) {
    console.error(error);
    errorRes(res, statusCode.Internal_Server_Error, messages.Server_Error);
  }
};
