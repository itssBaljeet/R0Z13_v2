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
  window.signal.send('test', 'role button clicked')
  openTab(event, 'Roles')
})

document.getElementById('parisButton').addEventListener('click', function(event) {
  window.signal.send('test', 'paris button')
  openTab(event, 'Paris')
})

document.getElementById('tokyoButton').addEventListener('click', function(event) {
  window.signal.send('test', 'tokyo button')
  openTab(event, 'Tokyo')
})


document.getElementById('remove-role-button').addEventListener ('click', function(event) {
  event.preventDefault()
  window.signal.send('remove-role')
})

document.getElementById('recreate-button').addEventListener('click', function(event) {
  event.preventDefault()
  window.signal.send('recreate-role')
})

window.signal.receive('role-id', (roleIds) => {
  return;
})



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
    })
    list.appendChild(newListItem)
  });
})
