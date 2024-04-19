document.getElementById("role-removal").addEventListener ('submit', function(event) {
  event.preventDefault()
  let roleId = document.getElementById('role-field').value
  window.signal.send('removeRole', roleId)
  document.getElementById('role-field').value = ''
})

window.signal.receive('role-id', (roleIds) => {
  window.signal.send('test')
  let list = document.getElementById('role-list')
  roleIds.forEach(role => {
    let newListItem = document.createElement('li')
    newListItem.textContent = role
    newListItem.addEventListener('click', function(event) {
      // Remove 'selected class from all list items
      let listItems = document.querySelectorAll('#role-list li');
      listItems.forEach(item => item.classList.remove('selected'));
      // Add 'selected' class to the clicked item
      this.classList.add('selected');
      selectedRole = this.textContent;
      window.signal.send('selectedURL', selectedRole)
      newListItem.classList.add("selected")
    })
    list.appendChild(newListItem)
  });
})
