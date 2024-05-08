function openTab(evt, tabName) {
  // Declare all variables
  var i, tabcontent, tablinks;

  // Get all elements with class="tabcontent" and hide them
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  // Get all elements with class="tablinks" and remove the class "active"
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  // Show the current tab, and add an "active" class to the button that opened the tab
  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.className += " active";
} 

document.getElementById('roleButton').addEventListener('click', function(event) {
  openTab(event, 'Roles')
})

document.getElementById('queueButton').addEventListener('click', function(event) {
  openTab(event, 'Queue')
})

document.getElementById('infoButton').addEventListener('click', function(event) {
  openTab(event, 'Info')
})


document.getElementById('remove-role-button').addEventListener ('click', function(event) {
  event.preventDefault()
  window.signal.send('remove-role')
})

document.getElementById('recreate-button').addEventListener('click', function(event) {
  event.preventDefault()
  window.signal.send('recreate-role')
})

document.getElementById('clear-queue-button').addEventListener('click', function(event) {
  event.preventDefault()
  window.signal.send('clear-queue')
})

document.getElementById('random-draw-button').addEventListener('click', function(event) {
  event.preventDefault()
  window.signal.send('random-draw')
})

document.getElementById("roleButton").click();

window.signal.receive('role-name', (roleNames) => {
  document.getElementById('role-list').innerHTML = '';
  document.getElementById('count').innerHTML = 'Role Recreation: \n0400'
  let list = document.getElementById('role-list')
  roleNames.forEach(role => {
    let newListItem = document.createElement('li')
    newListItem.textContent = role
    newListItem.addEventListener('click', function(event) {
      let listItems = document.querySelectorAll('#role-list li');
      listItems.forEach(item => item.classList.remove('selected'));
      this.classList.add('selected');
      selectedRole = this.textContent;
      window.signal.send('selected-role', selectedRole)
      newListItem.classList.add("selected")
      console.log(selectedRole)
    })
    list.appendChild(newListItem)
  });
})

window.signal.receive('queue-name', (queueNames) => {
  document.getElementById('queue').innerHTML = '';
  let list = document.getElementById('queue')
  queueNames.forEach(name => {
    let newListItem = document.createElement('li')
    newListItem.textContent = name
    newListItem.addEventListener('click', function(event) {
      let listItems = document.querySelectorAll('#queue li');
      listItems.forEach(item => item.classList.remove('selected'));
      this.classList.add('selected');
      selectedQueueName = this.textContent;
      window.signal.send('selected-queue-name', selectedQueueName)
      newListItem.classList.add("selected")
      console.log(selectedQueueName)
    })
    list.appendChild(newListItem)
  })
})