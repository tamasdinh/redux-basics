//  I. only an event can change the state of the store
//  II. the function that returns the new state must be a pure function


// Library code
function generateID() {
  return Math.random().toString(36).substring(2) + (new Date()).getTime().toString(36)
}

function createStore (reducer) {
  // Store should have 4 parts:
    // 1. State
    // 2. Getting the state
    // 3. Listen to changes in the state
    // 4. Update the state

    let state
    let listeners = []

    const getState = () => state

    const subscribe = (listener) => {
      listeners.push(listener)
      return () => {
        // this return function is to handle unsubscribing
        listeners = listeners.filter(l => l !== listener)
      }
    }

    const dispatch = (action) => {
      state = reducer(state, action)
      listeners.forEach((listener) => listener())
    }

    return {
      getState,
      subscribe,
      dispatch
    }
}


//  App code

const ADD_TODO = 'ADD_TODO'
const REMOVE_TODO = 'REMOVE_TODO'
const TOGGLE_TODO = 'TOGGLE_TODO'
const ADD_GOAL = 'ADD_GOAL'
const REMOVE_GOAL = 'REMOVE_GOAL'

//  Action creators
function addToDoAction (todo) {
  return {
    type: ADD_TODO,
    todo
  }
}

function removeToDoAction (id) {
  return {
    type: REMOVE_TODO,
    id
  }
}

function toggleToDoAction (id) {
  return {
    type: TOGGLE_TODO,
    id
  }
}

function addGoalAction (goal) {
  return {
    type: ADD_GOAL,
    goal
  }
}

function removeGoalAction (id) {
  return {
    type: REMOVE_GOAL,
    id
  }
}

//  REDUCERS
function todos(state = [], action) {
  // todos is a REDUCER function - defines how state should be replaced, given a certain action
  switch (action.type) {
    case ADD_TODO:
      return state.concat([action.todo])  // .concat returns new array, so it's a pure function
    case REMOVE_TODO:
      return state.filter((todo) => todo.id !== action.id)
    case TOGGLE_TODO:
      return state.map(todo => todo.id !== action.id ? todo : 
      Object.assign({}, todo, {complete: !todo.complete}))
    }
  return state
}

function goals(state = [], action) {
  switch(action.type) {
    case ADD_GOAL:
      return state.concat([action.goal])
    case REMOVE_GOAL:
      return state.filter((item) => item.id !== action.id)
    default:
      return state
  }
}

function app(state = [], action) {
  //  app is a COMBINED REDUCER that returns both the todos and goals parts of the state
  return {
    todos: todos(state.todos, action),
    goals: goals(state.goals, action)
  }
}


//  UI interactivity
function addToDo () {
  const input = document.getElementById('todos-input')
  const name = input.value
  if (input.value) {
    input.value = ''
    store.dispatch(addToDoAction({
      id: generateID(),
      name,
      complete: false,
    }))
  }
}

function addGoal () {
  const input = document.getElementById('goals-input')
  const name = input.value
  if (input.value) {
    input.value = ''
    store.dispatch(addGoalAction({
      id: generateID(),
      name,
    }))
  }
}

function toggleTodo (event) {
  const { todos } = store.getState()
  const todo = todos.filter(todo => todo.name === event.target.innerHTML)[0]
  if (todo) {
    store.dispatch(toggleToDoAction(todo.id))
  }
}


//  DOM code
document.getElementById('todo-button').addEventListener('click', addToDo)
document.getElementById('goal-button').addEventListener('click', addGoal)
document.getElementById('todo-list').addEventListener('click', event => toggleTodo(event))

function createRemoveButton (onclick) {
  const removeButton = document.createElement('button')
  removeButton.innerHTML = 'X'
  removeButton.addEventListener('click', onclick)
  return removeButton
}

function addTodoToDOM (todo) {
  const listContainer = document.getElementById('todo-list')
  const listItem = document.createElement('li')
  listItem.innerHTML = todo.name

  const removeButton = createRemoveButton(() => {
    store.dispatch(removeToDoAction(todo.id))
  })
  
  if (todo.complete) {
    listItem.style.textDecoration = 'line-through'
  }
  listContainer.appendChild(listItem)
  listContainer.appendChild(removeButton)
}

function addGoalToDOM (goal) {
  const listContainer = document.getElementById('goal-list')
  const listItem = document.createElement('li')
  const removeButton = createRemoveButton(() => {
    store.dispatch(removeGoalAction(goal.id))
  })
  listItem.innerHTML = goal.name
  listContainer.appendChild(listItem)
  listContainer.appendChild(removeButton)
}


// //  TESTS
const store = createStore(app)
store.subscribe(() => {
  console.log('The new state is:', store.getState())
  
  const { goals, todos } = store.getState()
  
  document.getElementById('todo-list').innerHTML = ''
  document.getElementById('goal-list').innerHTML = ''

  todos.forEach(todo => addTodoToDOM(todo))
  goals.forEach(goal => addGoalToDOM(goal))
})