import React, { useEffect, useState } from 'react';
import { Button, Card, CardBody, CardFooter, CardHeader, Form } from 'react-bootstrap';

// Generate simple unique ID
const generateId = () => '_' + Math.random().toString(36).substr(2, 9);

// 24 hours in milliseconds
const EXPIRATION_TIME = 24 * 60 * 60 * 1000;

const Todo = () => {
  const [task, setTask] = useState("");
  const [taskList, setTaskList] = useState([]);
  const [indexToBeEdited, setIndexToBeEdited] = useState(-1);
  const [taskToBeEdited, setTaskToBeEdited] = useState("");
  const [doneTasks, setDoneTasks] = useState([]); // array of task ids
  const [postponedTasks, setPostponedTasks] = useState([]); // array of task ids

  // Load tasks on mount, filtering out expired ones
  useEffect(() => {
    const now = Date.now();
    const storedTasks = JSON.parse(localStorage.getItem("tasks")) || [];

    const validTasks = storedTasks.filter(task =>
      task?.createdAt && typeof task.createdAt === 'number' &&
      now - task.createdAt < EXPIRATION_TIME
    );

    setTaskList(validTasks);

    const storedDone = JSON.parse(localStorage.getItem("doneTasks")) || [];
    setDoneTasks(storedDone);

    const storedPostponed = JSON.parse(localStorage.getItem("postponedTasks")) || [];
    setPostponedTasks(storedPostponed);
  }, []);

  // Save tasks and clean up references
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(taskList));

    const taskIds = taskList.map(t => t.id);

    const validDone = doneTasks.filter(id => taskIds.includes(id));
    localStorage.setItem("doneTasks", JSON.stringify(validDone));
    setDoneTasks(validDone);

    const validPostponed = postponedTasks.filter(id => taskIds.includes(id));
    localStorage.setItem("postponedTasks", JSON.stringify(validPostponed));
    setPostponedTasks(validPostponed);
  }, [taskList, doneTasks, postponedTasks]);

  const handleChange = (e) => setTask(e.target.value);

  const handleAdd = () => {
    if (task.trim().length > 0) {
      const newTask = {
        id: generateId(),
        text: task.trim(),
        createdAt: Date.now()
      };
      setTaskList([...taskList, newTask]);
      setTask("");
    } else {
      alert("Task should not be empty!");
    }
  };

  const handleDelete = (id) => {
    setTaskList(taskList.filter(task => task.id !== id));
    setDoneTasks(doneTasks.filter(doneId => doneId !== id));
    setPostponedTasks(postponedTasks.filter(postId => postId !== id));
  };

  const handleDone = (id) => {
    setDoneTasks(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handlePostpone = (id) => {
    setPostponedTasks(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleEdit = (task, index) => {
    setIndexToBeEdited(index);
    setTaskToBeEdited(task.text);
  };

  const handleEditChange = (e) => setTaskToBeEdited(e.target.value);

  const handleSave = (index) => {
    const updated = [...taskList];
    updated[index] = { ...updated[index], text: taskToBeEdited };
    setTaskList(updated);
    setIndexToBeEdited(-1);
  };

  return (
    <>
      <div className='container mt-5'>
        <Card>
          <CardHeader>
            <h2 className='text-center'>To Do List</h2>
          </CardHeader>
          <CardBody>
            <Form.Control
              placeholder="Enter new task"
              value={task}
              onChange={handleChange}
              onKeyDown={(e) => e.code === "Enter" && handleAdd()}
            />
          </CardBody>
          <CardFooter className='text-center'>
            <Button onClick={handleAdd}>Add Task</Button>
          </CardFooter>
        </Card>
      </div>

      <div className='container mt-4'>
        <h4 className='text-center'>Your Tasks</h4>
        {taskList.map((t, index) => {
          const isDone = doneTasks.includes(t.id);
          const isPostponed = postponedTasks.includes(t.id);
          const isEditing = indexToBeEdited === index;

          return (
            <div className='row align-items-center g-2 mb-2' key={t.id}>
              {/* Done Button */}
              <div className='col-2 col-sm-1 text-center'>
                <Button
                  variant={isDone ? 'success' : 'outline-success'}
                  onClick={() => handleDone(t.id)}
                  style={{ filter: isDone ? 'brightness(85%)' : 'none' }}
                >
                  <i className="bi bi-check2-circle"></i>
                </Button>
              </div>

              {/* Task Display / Edit */}
              <div className='col-6 col-sm-6'>
                {isEditing ? (
                  <Form.Control
                    value={taskToBeEdited}
                    onChange={handleEditChange}
                    autoFocus
                  />
                ) : (
                  <Button
                    variant={
                      isDone ? 'success'
                        : isPostponed ? 'warning'
                        : 'light'
                    }
                    className='w-100 text-start'
                    disabled
                  >
                    {t.text} {isPostponed && '(Postponed)'}
                  </Button>
                )}
              </div>

              {/* Edit / Save */}
              <div className='col-2 col-sm-1 text-center'>
                {isEditing ? (
                  <Button variant='primary' onClick={() => handleSave(index)}>
                    <i className="bi bi-floppy"></i>
                  </Button>
                ) : (
                  <Button variant='info' onClick={() => handleEdit(t, index)}>
                    <i className="bi bi-pencil"></i>
                  </Button>
                )}
              </div>

              {/* Postpone */}
              <div className='col-2 col-sm-1 text-center'>
                <Button
                  variant={isPostponed ? 'warning' : 'outline-warning'}
                  onClick={() => handlePostpone(t.id)}
                  style={{ filter: isPostponed ? 'brightness(85%)' : 'none' }}
                >
                  <i className="bi bi-hourglass"></i>
                </Button>
              </div>

              {/* Delete */}
              <div className='col-2 col-sm-1 text-center'>
                <Button variant='danger' onClick={() => handleDelete(t.id)}>
                  <i className="bi bi-trash"></i>
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default Todo;
