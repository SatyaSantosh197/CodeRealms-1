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
});
