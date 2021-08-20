const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
const format = require("date-fns/format");
const compareAsc = require("date-fns/compareAsc");
const isValid = require("date-fns/isValid");
app.use(express.json());

const dbPath = path.join(__dirname, "todoApplication.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running at http://localhost:3000/");
    });
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const hasOnlyStatusProperty = (requestQuery) => {
  const { id, todo, priority, status, category, dueDate } = requestQuery;
  return (
    id === undefined &&
    todo === undefined &&
    priority === undefined &&
    status !== undefined &&
    category === undefined &&
    dueDate === undefined
  );
};

const hasOnlyPriorityProperty = (requestQuery) => {
  const { id, todo, priority, status, category, dueDate } = requestQuery;
  return (
    id === undefined &&
    todo === undefined &&
    priority !== undefined &&
    status === undefined &&
    category === undefined &&
    dueDate === undefined
  );
};

const hasBothPriorityAndStatusProperties = (requestQuery) => {
  const { id, todo, priority, status, category, dueDate } = requestQuery;
  return (
    id === undefined &&
    todo === undefined &&
    priority !== undefined &&
    status !== undefined &&
    category === undefined &&
    dueDate === undefined
  );
};

const hasBothCategoryAndStatusProperties = (requestQuery) => {
  const { id, todo, priority, status, category, dueDate } = requestQuery;
  return (
    id === undefined &&
    todo === undefined &&
    priority === undefined &&
    status !== undefined &&
    category !== undefined &&
    dueDate === undefined
  );
};

const hasOnlyCategoryProperty = (requestQuery) => {
  const { id, todo, priority, status, category, dueDate } = requestQuery;
  return (
    id === undefined &&
    todo === undefined &&
    priority === undefined &&
    status === undefined &&
    category !== undefined &&
    dueDate === undefined
  );
};

const hasBothCategoryAndPriorityProperties = (requestQuery) => {
  const { id, todo, priority, status, category, dueDate } = requestQuery;
  return (
    id === undefined &&
    todo === undefined &&
    priority !== undefined &&
    status === undefined &&
    category !== undefined &&
    dueDate === undefined
  );
};

//API1

app.get("/todos/", async (request, response) => {
  let data = null;
  let getTodosQuery = "";
  const {
    id,
    todo,
    priority,
    status,
    category,
    due_date,
    search_q = "",
  } = request.query;
  const priorityResult =
    priority === "HIGH" || priority === "MEDIUM" || priority === "LOW";
  const statusResult =
    status === "TO DO" || status === "IN PROGRESS" || status === "DONE";
  const categoryResult =
    category === "WORK" || category === "HOME" || category === "LEARNING";
  switch (true) {
    case hasOnlyStatusProperty(request.query):
      if (statusResult === true) {
        getTodosQuery = `
            SELECT 
                id,
                todo,
                priority,
                status,
                category,
                due_date as dueDate
            FROM 
                todo 
            WHERE 
                status = '${status}';`;
        data = await db.all(getTodosQuery);
        response.send(data);
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;
    case hasOnlyPriorityProperty(request.query):
      if (priorityResult === true) {
        getTodosQuery = `
            SELECT 
                id,
                todo,
                priority,
                status,
                category,
                due_date as dueDate
            FROM 
                todo 
            WHERE 
                priority = '${priority}';`;
        data = await db.all(getTodosQuery);
        response.send(data);
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;
    case hasBothPriorityAndStatusProperties(request.query):
      if (priorityResult === true && statusResult === true) {
        getTodosQuery = `
            SELECT 
                id,
                todo,
                priority,
                status,
                category,
                due_date as dueDate
            FROM 
                todo 
            WHERE 
                priority = '${priority}' AND status = '${status}';`;
        data = await db.all(getTodosQuery);
        response.send(data);
      } else {
        if (priorityResult === false) {
          response.status(400);
          response.send("Invalid Todo Priority");
        } else {
          response.status(400);
          response.send("Invalid Todo Status");
        }
      }
      break;
    case hasBothCategoryAndStatusProperties(request.query):
      if (categoryResult === true && statusResult === true) {
        getTodosQuery = `
            SELECT 
                id,
                todo,
                priority,
                status,
                category,
                due_date as dueDate
            FROM 
                todo 
            WHERE 
                category = '${category}' AND status = '${status}';`;
        data = await db.all(getTodosQuery);
        response.send(data);
      } else {
        if (categoryResult === false) {
          response.status(400);
          response.send("Invalid Todo Category");
        } else {
          response.status(400);
          response.send("Invalid Todo Status");
        }
      }
      break;
    case hasOnlyCategoryProperty(request.query):
      if (categoryResult === true) {
        getTodosQuery = `
            SELECT 
                id,
                todo,
                priority,
                status,
                category,
                due_date as dueDate
            FROM 
                todo 
            WHERE 
                category = '${category}';`;
        data = await db.all(getTodosQuery);
        response.send(data);
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;
    case hasBothCategoryAndPriorityProperties(request.query):
      if (categoryResult === true && priorityResult === true) {
        getTodosQuery = `
            SELECT 
                id,
                todo,
                priority,
                status,
                category,
                due_date as dueDate
            FROM 
                todo 
            WHERE 
                category = '${category}' AND priority = '${priority}';`;
        data = await db.all(getTodosQuery);
        response.send(data);
      } else {
        if (categoryResult === false) {
          response.status(400);
          response.send("Invalid Todo Category");
        } else {
          response.status(400);
          response.send("Invalid Todo Priority");
        }
      }
      break;
    default:
      getTodosQuery = `
            SELECT 
                id,
                todo,
                priority,
                status,
                category,
                due_date as dueDate
            FROM 
                todo 
            WHERE 
                todo LIKE '%${search_q}%';`;
      data = await db.all(getTodosQuery);
      response.send(data);
  }
});

//API2

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodosQuery = `
        SELECT 
            id,
            todo,
            priority,
            status,
            category,
            due_date as dueDate
        FROM 
            todo 
        WHERE 
            id = '${todoId}';`;
  const data = await db.get(getTodosQuery);
  response.send(data);
});

//API3

app.get("/agenda/", async (request, response) => {
  const { date } = request.query;
  const dateResult = isValid(new Date(date));
  if (isValid(new Date(date))) {
    const dateValid = format(new Date(date), "yyyy-MM-dd");
    const getTodosQuery = `
        SELECT 
            id,
            todo,
            priority,
            status,
            category,
            due_date as dueDate
        FROM 
            todo 
        WHERE 
            due_date = '${dateValid}';`;
    const data = await db.all(getTodosQuery);
    response.send(data);
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }
});

//API4

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;
  const postPriorityResult =
    priority === "HIGH" || priority === "MEDIUM" || priority === "LOW";
  const postStatusResult =
    status === "TO DO" || status === "IN PROGRESS" || status === "DONE";
  const postCategoryResult =
    category === "WORK" || category === "HOME" || category === "LEARNING";
  const postDueDateResult = isValid(new Date(dueDate));
  if (
    postPriorityResult === true &&
    postStatusResult === true &&
    postCategoryResult === true &&
    postDueDateResult === true
  ) {
    const postTodosQuery = `
            INSERT INTO 
                todo (id, todo, priority, status, category, due_date)
            VALUES 
                (${id}, '${todo}', '${priority}', '${status}', '${category}', '${dueDate}');`;
    await db.run(postTodosQuery);
    response.send("Todo Successfully Added");
  } else {
    if (postPriorityResult === false) {
      response.status(400);
      response.send("Invalid Todo Priority");
    } else if (postStatusResult === false) {
      response.status(400);
      response.send("Invalid Todo Status");
    } else if (postCategoryResult === false) {
      response.status(400);
      response.send("Invalid Todo Category");
    } else if (postDueDateResult === false) {
      response.status(400);
      response.send("Invalid Due Date");
    }
  }
});

//API5

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const requestBody = request.body;
  let columnName = "";
  switch (true) {
    case requestBody.status !== undefined:
      columnName = "Status";
      break;
    case requestBody.todo !== undefined:
      columnName = "Todo";
      break;
    case requestBody.priority !== undefined:
      columnName = "Priority";
      break;
    case requestBody.category !== undefined:
      columnName = "Category";
      break;
    case requestBody.dueDate !== undefined:
      columnName = "Due Date";
      break;
  }
  const getPreviousDetails = `
    SELECT 
        *
    FROM 
        todo 
    WHERE 
        id = ${todoId};`;
  const data = await db.get(getPreviousDetails);
  const {
    status = data.status,
    todo = data.todo,
    priority = data.priority,
    category = data.category,
    dueDate = data.due_date,
  } = request.body;
  const putPriorityResult =
    priority === "HIGH" || priority === "MEDIUM" || priority === "LOW";
  const putStatusResult =
    status === "TO DO" || status === "IN PROGRESS" || status === "DONE";
  const putCategoryResult =
    category === "WORK" || category === "HOME" || category === "LEARNING";
  const putDueDateResult = isValid(new Date(dueDate));
  if (
    putPriorityResult === true &&
    putStatusResult === true &&
    putCategoryResult === true &&
    putDueDateResult === true
  ) {
    const updateTodoQuery = `
        UPDATE
        todo
        SET
        status = '${status}',
        todo = '${todo}',
        priority = '${priority}',
        category = '${category}',
        due_date = '${dueDate}'
        WHERE
        id = ${todoId};`;

    await db.run(updateTodoQuery);
    response.send(`${columnName} Updated`);
  } else {
    if (putPriorityResult === false) {
      response.status(400);
      response.send("Invalid Todo Priority");
    } else if (putStatusResult === false) {
      response.status(400);
      response.send("Invalid Todo Status");
    } else if (putCategoryResult === false) {
      response.status(400);
      response.send("Invalid Todo Category");
    } else if (putDueDateResult === false) {
      response.status(400);
      response.send("Invalid Due Date");
    }
  }
});

//API6

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `
        DELETE FROM 
            todo 
        WHERE 
            id = ${todoId};`;
  await db.run(deleteTodoQuery);
  response.send("Todo Deleted");
});

module.exports = app;
