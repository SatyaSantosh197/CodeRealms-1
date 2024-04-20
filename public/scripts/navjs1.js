// Get all the buttons by their IDs
const btnHome = document.getElementById('homeicon');
const btnQuestion = document.getElementById('questionicon');
const btnProfile = document.getElementById('profileicon');

// Variable to store the previously clicked button
let prevClickedBtn = null;

// Function to handle click event
function onClick(event) {
  // Change text color for clicked element only
  event.target.style.color = 'rgb(255, 255, 255)';
  // Change font size for clicked element only
  event.target.style.fontSize = '20px';
  // Add white bottom border
  event.target.style.borderBottom = '2px solid white';
  event.target.style.borderRadius = '1px';
  event.target.style.transform='translateY(0px)'

  // Revert properties of the previously clicked button
  if (prevClickedBtn && prevClickedBtn !== event.target) {
    prevClickedBtn.style.color = '';
    prevClickedBtn.style.fontSize = '';
    prevClickedBtn.style.borderBottom = '';
    prevClickedBtn.style.borderRadius = '';
  }

  // Update the previously clicked button
  prevClickedBtn = event.target;
}

// Add click event listeners to each button
btnHome.addEventListener('click', onClick);
btnQuestion.addEventListener('click', onClick);
btnProfile.addEventListener('click', onClick);

const exitIcon = document.getElementById('exitIcon');
const description = document.getElementById('description');

// exitIcon.addEventListener('click', function() {
//     const confirmLogout = window.confirm("Are you sure you want to log out?");
//     if (confirmLogout) {
//         // Perform logout action here
//         // For now, let's just hide the description
//         description.style.display = 'none';
//     }
// });
document.getElementById("exitIcon").onclick = function() {
  document.querySelector(".profileOptions").classList.toggle("show");
}

