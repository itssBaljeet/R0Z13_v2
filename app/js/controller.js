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
  window.signal.send('test')
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
