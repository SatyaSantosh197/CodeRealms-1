document.addEventListener('DOMContentLoaded', function () {
    const createRealmeButton = document.querySelector('.make_realme_button_org');
    const rightUpperDiv = document.querySelector('.right_upper');
    const dropdownContainer = document.querySelector('.realme_container');

    let formCreated = false;

    createRealmeButton.addEventListener('click', function () {
        createForm();
    });

    function createForm() {
        clearRightUpper();

        if (!formCreated) {
            const form = document.createElement('form');
            form.classList.add('realme-form');

            const nameLabel = document.createElement('label');
            nameLabel.textContent = 'Name of Realm:';
            const nameInput = document.createElement('input');
            nameInput.setAttribute('type', 'text');
            nameInput.setAttribute('placeholder', 'Enter name of Realm');
            nameInput.setAttribute('required', '');
            nameInput.setAttribute('name', 'realmName');

            const contestsLabel = document.createElement('label');
            contestsLabel.textContent = 'Contests:';
            const contestsContainer = document.createElement('div');
            contestsContainer.classList.add('contest-container');

            const addContestButton = document.createElement('button');
            addContestButton.textContent = 'Add Contest';
            addContestButton.addEventListener('click', function () {
                createContestInput(contestsContainer);
            });

            const submitButton = document.createElement('button');
            submitButton.setAttribute('type', 'submit');
            submitButton.textContent = 'Create Realm';

            form.addEventListener('submit', function (event) {
                event.preventDefault();
                const formData = new FormData(form);
                const realmName = formData.get('realmName');
                const contestInputs = contestsContainer.querySelectorAll('.contest-input');
                const contests = [];
                const problems = [];

                contestInputs.forEach(input => {
                    const contestName = input.querySelector('input[name="contestName"]').value;
                    const problemInputs = input.querySelectorAll('.problem-input');
                    const contestProblems = [];

                    problemInputs.forEach(problemInput => {
                        const problem = {
                            question: problemInput.querySelector('input[name="problemQuestion"]').value,
                            rating: problemInput.querySelector('input[name="problemRating"]').value,
                            points: problemInput.querySelector('input[name="problemPoints"]').value
                        };
                        contestProblems.push(problem);
                        problems.push(problem); // Push problem into problems array
                    });

                    const contest = {
                        name: contestName,
                        problems: contestProblems
                    };
                    contests.push(contest);
                });

                const realmData = {
                    name: realmName,
                    contests: contests,
                    problems: problems
                };

                // Send realmData to the server to save in the database
                fetch('/create-realm', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(realmData)
                })
                    // After realm creation success
                    .then(response => {
                        if (response.ok) {
                            console.log('Realm created successfully');
                            // Reload the page after successful creation
                            location.reload("/organisation_page");
                        } else {
                            throw new Error('Failed to create realm');
                        }
                    })
                    .catch(error => {
                        console.error(error); // Handle error
                        // Show error message
                    });
            });

            form.appendChild(nameLabel);
            form.appendChild(nameInput);
            form.appendChild(contestsLabel);
            form.appendChild(contestsContainer);
            form.appendChild(addContestButton);
            form.appendChild(submitButton);

            rightUpperDiv.appendChild(form);

            formCreated = true;
        }
    }

    function createContestInput(container) {
        const contestDiv = document.createElement('div');
        contestDiv.classList.add('contest-input');

        const contestLabel = document.createElement('label');
        contestLabel.textContent = 'Contest Name:';
        const contestNameInput = document.createElement('input');
        contestNameInput.setAttribute('type', 'text');
        contestNameInput.setAttribute('placeholder', 'Enter contest name');
        contestNameInput.setAttribute('required', '');
        contestNameInput.setAttribute('name', 'contestName');

        const addProblemButton = document.createElement('button');
        addProblemButton.textContent = 'Add Problem';
        addProblemButton.addEventListener('click', function () {
            createProblemInput(contestDiv);
        });

        contestDiv.appendChild(contestLabel);
        contestDiv.appendChild(contestNameInput);
        contestDiv.appendChild(addProblemButton);

        container.appendChild(contestDiv);
    }

    function createProblemInput(container) {
        const problemDiv = document.createElement('div');
        problemDiv.classList.add('problem-input');

        const problemLabel = document.createElement('label');
        problemLabel.textContent = 'Problem Details:';

        const questionLabel = document.createElement('label');
        questionLabel.textContent = 'Question:';
        const questionInput = document.createElement('input');
        questionInput.setAttribute('type', 'text');
        questionInput.setAttribute('placeholder', 'Enter problem question');
        questionInput.setAttribute('required', '');
        questionInput.setAttribute('name', 'problemQuestion');

        const ratingLabel = document.createElement('label');
        ratingLabel.textContent = 'Rating:';
        const ratingInput = document.createElement('input');
        ratingInput.setAttribute('type', 'number');
        ratingInput.setAttribute('placeholder', 'Enter problem rating');
        ratingInput.setAttribute('required', '');
        ratingInput.setAttribute('name', 'problemRating');

        const pointsLabel = document.createElement('label');
        pointsLabel.textContent = 'Points:';
        const pointsInput = document.createElement('input');
        pointsInput.setAttribute('type', 'number');
        pointsInput.setAttribute('placeholder', 'Enter problem points');
        pointsInput.setAttribute('required', '');
        pointsInput.setAttribute('name', 'problemPoints');

        problemDiv.appendChild(problemLabel);
        problemDiv.appendChild(questionLabel);
        problemDiv.appendChild(questionInput);
        problemDiv.appendChild(ratingLabel);
        problemDiv.appendChild(ratingInput);
        problemDiv.appendChild(pointsLabel);
        problemDiv.appendChild(pointsInput);

        container.appendChild(problemDiv);
    }

    function clearRightUpper() {
        rightUpperDiv.innerHTML = '';
    }


    function displayContests(realmName) {
        fetch('/fetch-contests', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ realmName })
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Failed to fetch contests');
            }
        })
        .then(data => {
            // Clear the right-upper section
            clearRightUpper();
    
            if (data.success) {
                // Create a container for the realm
                const realmContainer = document.createElement('div');
                realmContainer.classList.add('realm-container');
    
                // Display realm name
                const realmNameElement = document.createElement('h2');
                realmNameElement.textContent = `Realm Name: ${realmName}`;
                realmContainer.appendChild(realmNameElement);
    
                // Create a container for contests
                const contestContainer = document.createElement('div');
                contestContainer.classList.add('contest-container');
    
                // Check if contests are available
                if (data.contestNames && data.contestNames.length > 0) {
                    // Iterate over fetched contest names and create elements to display them
                    data.contestNames.forEach(contestName => {
                        const contestElement = document.createElement('div');
                        contestElement.textContent = `- ${contestName}`; // Display contest name
                        contestContainer.appendChild(contestElement);
                    });
                } else {
                    const noContestsElement = document.createElement('p');
                    noContestsElement.textContent = 'No contests found for this realm.';
                    contestContainer.appendChild(noContestsElement);
                }
    
                // Append the contest container to the realm container
                realmContainer.appendChild(contestContainer);
    
                // Append the realm container to the right-upper section
                rightUpperDiv.appendChild(realmContainer);
    
                // Create and append "Add New Contest" button
                const addNewContestButton = document.createElement('button');
                addNewContestButton.textContent = 'Add New Contest';
                addNewContestButton.classList.add('add-new-contest-button');
                realmContainer.appendChild(addNewContestButton);
    
                // Add event listener to "Add New Contest" button
                addNewContestButton.addEventListener('click', function () {
                    // Clear the right-upper section
                    clearRightUpper();
    
                    // Display form for creating a new contest
                    const createContestForm = document.createElement('form');
                    createContestForm.classList.add('create-contest-form');
    
                    // Create inputs for contest details
                    const nameLabel = document.createElement('label');
                    nameLabel.textContent = 'Contest Name:';
                    const nameInput = document.createElement('input');
                    nameInput.setAttribute('type', 'text');
                    nameInput.setAttribute('placeholder', 'Enter contest name');
                    nameInput.setAttribute('required', '');
    
                    // Create a button to submit the form
                    const submitButton = document.createElement('button');
                    submitButton.setAttribute('type', 'submit');
                    submitButton.textContent = 'Create Contest';
    
                    // Add event listener to form submission
                    createContestForm.addEventListener('submit', function (event) {
                        event.preventDefault();
    
                        // Retrieve contest name from the form
                        const contestName = nameInput.value;
    
                        // Send contest data to the server to create a new contest
                        fetch('/create-contest', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ realmName, contestName })
                        })
                        .then(data => {
                            if (data.success) {
                                // Add the newly created contest's ObjectId to the realm
                                const realmName = document.querySelector('.dropdown-btn').textContent;
                                fetch('/update-realm', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({ realmName, contestId: data.contestId })
                                })
                                .then(response => {
                                    if (response.ok) {
                                        // If updating realm is successful, display contests again
                                        displayContests(realmName);
                                    } else {
                                        throw new Error('Failed to update realm with new contest');
                                    }
                                })
                                .catch(error => {
                                    console.error(error);
                                    // Handle error updating realm
                                });
                            } else {
                                throw new Error(data.message || 'Failed to create contest');
                            }
                        })
                        
                        .catch(error => {
                            console.error(error); // Handle error
                            // Show error message
                        });
                    });
    
                    // Append inputs and submit button to the form
                    createContestForm.appendChild(nameLabel);
                    createContestForm.appendChild(nameInput);
                    createContestForm.appendChild(submitButton);
    
                    // Append the form to the right-upper section
                    rightUpperDiv.appendChild(createContestForm);
                });
            } else {
                throw new Error(data.message || 'Failed to fetch contests');
            }
        })
        .catch(error => {
            console.error(error); // Handle error
            // Show error message
        });
    }
    
    // Add event listener to dropdown buttons to display contests when clicked
    dropdownContainer.addEventListener('click', function (event) {
        if (event.target && event.target.classList.contains('dropdown-btn')) {
            const realmName = event.target.textContent;
            displayContests(realmName);
        }
    });
    





});
