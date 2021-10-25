document.addEventListener('DOMContentLoaded', function () {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  // attach event listener to form
  const submitForm = document.querySelector('#compose-form');
  submitForm.addEventListener('submit', (event) => {
    // prevent default submission
    event.preventDefault();

    // collect form inputs
    const recipients = document.querySelector('#compose-recipients').value;
    const subject = document.querySelector('#compose-subject').value;
    const body = document.querySelector('#compose-body').value;

    // POST to the server
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
      })
    })
      .then((response) => response.json())
      .then((result) => console.log(result));
    // load 'sent' box
    load_mailbox('sent');
  })


}

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;


  // make the request for a specific mailbox
  fetch(`/emails/${mailbox}`)
    .then((response) => response.json())
    .then((emails) => {
      for (let email of emails) renderEmailList(email, mailbox);
    });

}

/** Helper function to construct the email list */
function renderEmailList(email) {
  const emailsDiv = document.querySelector('#emails-view');
  const emailDiv = document.createElement('div');
  emailDiv.setAttribute('id', 'emailDiv');
  emailDiv.setAttribute('class', 'border rounded mb-1');
  email.read == false ? emailDiv.style.backgroundColor = 'white' : emailDiv.style.backgroundColor = 'lightgrey';

  const mainCol = document.createElement('div');
  mainCol.setAttribute('class', 'row m-1');
  mainCol.innerHTML = `
  <div class="col-10" id="row"> <strong> ${email.sender} </strong> | ${email.subject} | <small>${email.timestamp}</small> </div>
  `;
  emailDiv.appendChild(mainCol);
  emailsDiv.appendChild(emailDiv);

  emailDiv.addEventListener('click', () => {
    markAsRead(email.id);
    displayEmail(email.id);
  })


}


function displayEmail(email_id, mailbox) {
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';
  document.querySelector('#email-view').innerHTML = '';
  fetch(`/emails/${email_id}`)
    .then((response) => response.json())
    .then((email) => {
        const infoDiv = document.createElement('div');
        infoDiv.setAttribute('class', 'border-bottom mb-1');
        infoDiv.innerHTML = `
          <div class ="m-1">
            <p>Sender: <strong> ${email.sender} </strong> </p>
            <p>Recipients: ${email.recipients} </p>
            <p>Subject: ${email.subject} </p>
            <small> Sent: ${email.timestamp} </small>
        </div>
    `;
      document.querySelector('#email-view').appendChild(infoDiv);

      const btnsDiv = document.createElement('div');
      btnsDiv.setAttribute('class', 'btn-group');
      btnsDiv.setAttribute('role', 'group');
      document.querySelector('#email-view').appendChild(btnsDiv);

      const replyBtn = document.createElement('button');
      replyBtn.setAttribute('class', 'btn btn-sm btn-outline-primary');
      replyBtn.textContent = 'Reply';
      btnsDiv.appendChild(replyBtn);

      const archiveBtn = document.createElement('button');
      archiveBtn.setAttribute('class', 'btn btn-sm btn-outline-info ml-1');
      email.archived == false ? archiveBtn.textContent = 'Archive' : archiveBtn.textContent = 'Unarchive';
      btnsDiv.appendChild(archiveBtn);

      const mainDiv = document.createElement('div');
      mainDiv.setAttribute('class', 'container mt-3');
      mainDiv.innerText = email.body;
      document.querySelector('#email-view').appendChild(mainDiv);

      replyBtn.addEventListener('click', () => {
        document.querySelector('#email-view').style.display = 'none';
        compose_email();
        document.querySelector('#compose-recipients').value = email.sender;

        if (!email.subject.startsWith('Re:')) {
          document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
        }
        else {
          let split = email.subject.split('Re:');
          let target = split[1].trim();
          document.querySelector('#compose-subject').value = target;
        }
        const preFill = `\nOn ${email.timestamp} ${email.sender} wrote:\n`;
        document.querySelector('#compose-body').value = preFill + email.body;
      });

      archiveBtn.addEventListener('click', ()=> toggleArchive(email.id))
  
    })
}


/* Change the 'read' boolean flag to true once the email has been clicked */
function markAsRead(email_id) {
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({ read: true })
  })
    // print any errors to std out
    .catch((error) => console.log(error));
}

/* Toggle the 'archived' flag */
function toggleArchive(email_id) {
  fetch(`/emails/${email_id}`)
    .then(response => response.json())
    .then(email => {
      fetch(`/emails/${email.id}`, {
        method: 'PUT',
        body: JSON.stringify({ archived: !email.archived })
      })
      .then(()=> load_mailbox('inbox'));
    })
    .catch(error => console.log(error));
}
