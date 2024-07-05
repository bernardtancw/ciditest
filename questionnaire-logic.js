function generateQuestion(questionNumber, question, inputType, options, trigger) {
  if (question.match(/{([^}]*)}/)) {
    // if no questionValues declared yet, generate empty array
    if (typeof questionValues === "undefined") {
      questionValues = {};
    }
    dynamicVariables(questionPool, questionValues);
    let variable = question.match(/{([^}]*)}/)[1];
    question = question.replace(`{${
      variable
    }}`, eval
    (`${variable}`));
  }
  
  const defaultOption =
    '<option value="" disabled selected>Please select an option</option>'; // placeholder for dropdown
  let html = `
        <div class="form-group question ${
          compulsoryQuestions.includes(questionNumber) ? "" : "d-none"
        }" data-question="${questionNumber}">
            <label><strong>Question ${questionNumber}</strong>: ${
    inputType != "display" ? question : ""
  }</label>
    `;

  switch (inputType) {
    case "radio":
      if (Array.isArray(options)) {
        options.forEach((option) => {
          html += `
                    <div class="form-check">
                        <input class="form-check-input" type="${inputType}" name="question${questionNumber}" id="q${questionNumber}option${
            option.value
          }" value="${option.value}" data-trigger="${option.trigger || ""}">
                        <label class="form-check-label" for="q${questionNumber}option${
            option.value
          }">${option.label}</label>
                    </div>
                `;
        });
      } else {
        console.error(
          "generateQuestion: options is not an array for radio input type",
          { questionNumber, options }
        );
      }
      break;
    case "checkbox":
      if (Array.isArray(options)) {
        options.forEach(function (option) {
          html += '<div class="form-check">';
          html +=
            '<input class="form-check-input" type="checkbox" id="q' +
            questionNumber +
            "option" +
            option.value +
            '" value="' +
            option.value +
            '" data-trigger="' +
            (option.trigger ? option.trigger : "") +
            '">';
          html +=
            '<label class="form-check-label" for="q' +
            questionNumber +
            "option" +
            option.value +
            '">' +
            option.label +
            "</label>";
          html += "</div>";
        });
      } else {
        console.error(
          "generateQuestion: options is not an array for checkbox input type",
          { questionNumber, options }
        );
      }
      break;
      case "response":
        html += `
                  <div class="response-input">
                      <input class="form-control" type="text" id="q${questionNumber}response" name="question${questionNumber}response" placeholder="Your response" data-trigger="${
          trigger || ""
        }">
              `;
  
        if (Array.isArray(options) && options.length > 0) {
          options.forEach((option) => {
            html += `
                      <div class="form-check">
                          <input class="form-check-input" type="radio" name="question${questionNumber}" id="q${questionNumber}option${option.value}" value="${option.value}" data-trigger="${option.trigger || ""}">
                          <label class="form-check-label" for="q${questionNumber}option${option.value}">${option.label}</label>
                      </div>
                  `;
          });
        } else {
          html += `
                      <div class="form-check">
                          <input class="form-check-input" type="radio" name="question${questionNumber}" id="q${questionNumber}optionUnknown" value="998">
                          <label class="form-check-label" for="q${questionNumber}optionUnknown">Don't Know</label>
                      </div>
                      <div class="form-check">
                          <input class="form-check-input" type="radio" name="question${questionNumber}" id="q${questionNumber}optionRefused" value="999">
                          <label class="form-check-label" for="q${questionNumber}optionRefused">Refused</label> 
                      </div>
                  `;
        }
  
        html += `
                  </div>
                  <button type="button" class="btn btn-secondary clear-radio">Clear</button> ${
                    trigger
                      ? `<button type="button" class="btn btn-primary proceed-btn" data-trigger="${trigger}">Proceed</button>`
                      : ""
                  }
              `;
        break;
    case "display":
      html += `
                <div class="display-text">${question}</div>
                ${
                  trigger
                    ? `<button type="button" class="btn btn-primary proceed-btn" data-trigger="${trigger}">Proceed</button>`
                    : ""
                }
            `;
      break;
    default:
      html += `
                <select class="form-control" data-question="${questionNumber}">
                    ${defaultOption}
                    ${
                      Array.isArray(options)
                        ? options
                            .map(
                              (option) =>
                                `<option value="${
                                  option.value
                                }" data-trigger="${option.trigger || ""}">${
                                  option.label
                                }</option>`
                            )
                            .join("")
                        : console.error(
                            "generateQuestion: options is not an array for default input type",
                            { questionNumber, options }
                          )
                    }
                </select>
            `;
      break;
  }

  html += "</div>";
  return html;
}

lagQuestionPool = { ...questionPool };

function storeQuestionValues() {
  var questionValues = [];
  document.querySelectorAll(".question").forEach(function (element) {
    if (!element.classList.contains("d-none")) {
      var select = element.querySelector("select");
      var responseInput = element.querySelector('input[type="text"]');
      var checkboxes = element.querySelectorAll(
        'input[type="checkbox"]:checked'
      );
      var radioButton = element.querySelector('input[type="radio"]:checked');
      var questionNumber = element.getAttribute("data-question"); // Get the question number
      var selectedOption;
      if (select) {
        selectedOption = select.options[select.selectedIndex];
      } else if (checkboxes.length > 0) {
        selectedOption = Array.from(checkboxes).map(
          (checkbox) => checkbox.value
        );
      } else {
        selectedOption = radioButton;
      }
      var selectedValue = selectedOption
        ? Array.isArray(selectedOption)
          ? selectedOption
          : selectedOption.value
        : responseInput
        ? responseInput.value
        : ""; // Handle null responseInput
      // sanitise potential dirty input day for numeric fields
      if (/^\d/.test(selectedValue) && !selectedValue.includes(",") && selectedValue.includes(" ")) {
        selectedValue = selectedValue.split(" ")[0];
      }
      questionValues.push({ number: questionNumber, value: selectedValue });
    }
  });

  return questionValues;
}

function getQuestionValueByNumber(questionValues, questionNumber) {
  if (!Array.isArray(questionValues)) {
    questionValues = Object.values(questionValues); // Convert to array
  }
  let question = questionValues.find(q => q.number === questionNumber);
  return question ? question.value : null; // Returns null if not found
}

const questionContainer = document.getElementById("questionContainer");
const questionForm = document.getElementById("questionForm");
questionForm.addEventListener("change", handleQuestionChange);
const clauses = {
  D12feeling: (questionPool, {}) => {
    if (questionPool.hasOwnProperty('D3')) return 'hasD3';
    else if (questionPool.hasOwnProperty('D4')) return 'hasD4';
    else if (questionPool.hasOwnProperty('D5')) return 'hasD5';
    else if (questionPool.hasOwnProperty('D6')) return 'hasD6';
    else if (questionPool.hasOwnProperty('D7')) return 'hasD7';
    else if (questionPool.hasOwnProperty('D8')) return 'hasD8';
    else return 'hasD11';
  },
  D12feelingv2: (questionPool, {}) => {
    if (questionPool.hasOwnProperty('D3')) return 'hasD3';
    else if (questionPool.hasOwnProperty('D4')) return 'hasD4';
    else if (questionPool.hasOwnProperty('D5')) return 'hasD5';
    else if (questionPool.hasOwnProperty('D6')) return 'hasD6';
    else if (questionPool.hasOwnProperty('D7')) return 'hasD7';
    else if (questionPool.hasOwnProperty('D8')) return 'hasD8';
    else return 'hasD11';
  },
  D_freq: (questionPool, {}) => {
    if (questionPool.hasOwnProperty('D15')) return 'hasD15';
    else if (questionPool.hasOwnProperty('D16')) return 'hasD16';
  },
  D22dtime: (questionPool, {}) => {
    // Extract numerical values
    const D22dValue = parseInt(questionPool['D22d']?.replace(/\D/g, '') || '0', 10);
    const D22d1Value = parseInt(questionPool['D22d1']?.replace(/\D/g, '') || '0', 10);

    // Map for units (DAYS, WEEKS, MONTHS, YEARS) to their multiplier in days
    const timeUnits = {
      1: 'days',
      2: 'weeks',
      3: 'months',
      4: 'years',
    };
    
    // Convert D22d1 value to days
    const daysMap = {
      1: D22dValue, // DAYS
      2: D22dValue * 7, // WEEKS to DAYS
      3: D22dValue * 30, // MONTHS to DAYS (approximation)
      4: D22dValue * 365, // YEARS to DAYS (approximation)
    };
    
    const days = daysMap[D22d1Value] || 0;

    // Convert days to the largest unit possible
    if (days >= 365) {
      return `years`;
    } else if (days >= 30) {
      return `months`;
    } else if (days >= 14) {
      return `2 weeks or more`;
    } else if (days >= 7) {
      return `1-2 weeks`;
    } else {
      return `days`;
    }
  },
  D27instructions: ({}, questionValues) => {
    let count = 0;
    // if ["D24a", [1]], ["D24b", [1]], ["D24c", [1]], ["D24d", [1]], 'or' is selected, then count = 1
    if ((getQuestionValueByNumber(questionValues, 'D24a') == '1') || 
      (getQuestionValueByNumber(questionValues, 'D24b') == '1') || 
      (getQuestionValueByNumber(questionValues, 'D24c') == '1') || 
      (getQuestionValueByNumber(questionValues, 'D24d') == '1')) {
      count += 1;
    }
    // if ["D24e", [1]], ["D24f", [1]], "or", +1
    if (getQuestionValueByNumber(questionValues, 'D24e') == '1' || getQuestionValueByNumber(questionValues, 'D24f') == '1') {
      count += 1;
    }
    // D26 a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,w_1,x,y,z,aa,bb,cc,dd,ee,ff,gg,hh,ii
    // make the qns into a list
    let D26questions = [
      "D26a", "D26b", "D26c", "D26d", "D26e", "D26f", "D26g", "D26h", "D26i", "D26j", "D26k", "D26l",
      "D26m", "D26n", "D26o", "D26p", "D26q", "D26r", "D26s", "D26t", "D26u", "D26v", "D26w", "D26w_1",
      "D26x", "D26y", "D26z", "D26aa", "D26bb", "D26cc", "D26dd", "D26ee", "D26ff", "D26gg", "D26hh", "D26ii"
    ];
    // count how many of questions in D26questions are selected as 1
    for (let i = 0; i < D26questions.length; i++) {
      if (getQuestionValueByNumber(questionValues, D26questions[i]) == 1) {
        count += 1;
      }
    }
    console.log("this is the d27 count" + count);
    if (count >= 2) {
      return true;
    } else {
      return false;
    }
  },
  D29feeling: ({}, questionValues) => {
    let feelings = [];

    if (getQuestionValueByNumber(questionValues, 'D24a') == '1') {
        feelings.push('sadness');
    }
    if (getQuestionValueByNumber(questionValues, 'D24c') == '1') {
        feelings.push('discouragement');
    }
    if (getQuestionValueByNumber(questionValues, 'D24e') == '1') {
        feelings.push('lack of interest');
    }

    return feelings.join('/');
  },
  D29dInstruction: ({}, questionValues) => {
    if (getQuestionValueByNumber(questionValues, 'D29') == '1') {
      return 'Select D29 EQUALS 1';
    } else {
      return 'Select ALL OTHERS';
    }
  },
    D20Instruction: ({}, questionValues) => {
    if (getQuestionValueByNumber(questionValues, 'D17') == '1' && getQuestionValueByNumber(questionValues, 'D18') == '4' && getQuestionValueByNumber(questionValues, 'D19') == '4') {
      return 'Select 1';
    } else {
      return 'Select ALL OTHERS';
    }
  },
  D38b1Instructions: ({}, questionValues) => {
    if (getQuestionValueByNumber(questionValues, 'D29') == '1') return 'show1';
    else if (getQuestionValueByNumber(questionValues, 'D29') == '2' || getQuestionValueByNumber(questionValues, 'D29') == '3') return 'show2';
    else return 'show3';
    }
  },
  D37eInstruction: ({}, questionValues) => {
    if (getQuestionValueByNumber(questionValues, 'D29') == '1' || getQuestionValueByNumber(questionValues, 'D29') == '2' || getQuestionValueByNumber(questionValues, 'D29') == '3') {
      return 'YES';
    } else {
      return 'Select ALL OTHERS';
    }
  },
  D37gInstruction: ({}, questionValues) => {
    if (getQuestionValueByNumber(questionValues, 'D29') == '1') {
      return 'YES';
    } else {
      return 'Select ALL OTHERS';
    }
  },
  // D37lInstruction
  D37lInstruction: ({}, questionValues) => {
    if (getQuestionValueByNumber(questionValues, 'D29') == '2') {
      return 'YES';
    } else {
      return 'Select ALL OTHERS';
    }
  },
};
const rules = [
  {
    variable: 'D12feeling',
    conditions: [
      { outcome: 'hasD3', value: 'SAD, DISCOURAGED, OR UNINTERESTED' },
      { outcome: 'hasD4', value: 'SAD OR DISCOURAGED' },
      { outcome: 'hasD5', value: 'SAD OR UNINTERESTED' },
      { outcome: 'hasD6', value: 'SAD' },
      { outcome: 'hasD7', value: 'DISCOURAGED OR UNINTERESTED' },
      { outcome: 'hasD8', value: 'DISCOURAGED' },
      { outcome: 'hasD11', value: 'uninterested in things' }
    ]
  },
   {
    variable: 'D12feelingv2',
    conditions: [
      { outcome: 'hasD3', value: 'SADNESS, DISCOURAGEMENT, OR LACK OF INTEREST' },
      { outcome: 'hasD4', value: 'SADNESS OR DISCOURAGEMENT' },
      { outcome: 'hasD5', value: 'SADNESS OR LACK OF INTEREST' },
      { outcome: 'hasD6', value: 'SADNESS' },
      { outcome: 'hasD7', value: 'DISCOURAGEMENT OR LACK OF INTEREST' },
      { outcome: 'hasD8', value: 'DISCOURAGEMENT' },
      { outcome: 'hasD11', value: 'LACK OF INTEREST' }
    ]
  },
  {
    variable: 'D22dtime',
    conditions: [
      { outcome: 'days', value: 'days' },
      { outcome: '1-2 weeks', value: '1-2 weeks' },
      { outcome: '2 weeks or more', value: '2 weeks or more' },
      { outcome: 'months', value: 'months' },
      { outcome: 'years', value: 'years' }
    ]
  },
  {
    variable: 'D_freq',
    conditions: [
      { outcome: 'hasD15', value: 'several days' },
      { outcome: 'hasD16', value: 'two weeks' }
    ]
  },    
  {
    variable: 'D27instructions',
    conditions: [
      { outcome: true, value: 'Select COUNT EQUALS TWO OR MORE' },
      { outcome: false, value: 'Select ALL OTHERS' }
    ]
  },
  {
    variable: 'D29feeling',
    conditions: [
      { outcome: 'sadness', value: 'sadness' },
      { outcome: 'discouragement', value: 'discouragement' },
      { outcome: 'uninterested', value: 'lack of interest' },
      { outcome: '', value: '' }
    ]
  },
  {
    variable: 'D29dInstruction',
    conditions: [
      { outcome: 'Select D29 EQUALS 1', value: 'Select D29 EQUALS 1' },
      { outcome: 'Select ALL OTHERS', value: 'Select ALL OTHERS' }
    ]
  },
    {
    variable: 'D20Instruction',
    conditions: [
      { outcome: 'Select 1', value: 'Select 1 for D20' },
      { outcome: 'Select ALL OTHERS', value: 'Select ALL OTHERS for D20' }
    ]
  },
  //(*D29 EQUALS “1 - 3”; Select 'All others' if you do not see D37e_instructions)
  {
    variable: 'D37eInstruction',
    conditions: [
      { outcome: 'YES', value: 'Select Yes' },
      { outcome: 'Select ALL OTHERS', value: 'Select ALL OTHERS' }
    ]
  },
  {
    variable: 'D37gInstruction',
    conditions: [
      { outcome: 'YES', value: 'Select Yes' },
      { outcome: 'Select ALL OTHERS', value: 'Select ALL OTHERS' }
    ]
  },
  // D37lInstruction
  {
    variable: 'D37lInstruction',
    conditions: [
      { outcome: 'YES', value: 'Select Yes' },
      { outcome: 'Select ALL OTHERS', value: 'Select ALL OTHERS' }
    ]
  },
  {
    variable: 'D38b1Instructions',
    conditions: [
      { outcome: 'show1', value: "D29 = 1, Please select D29 Equals 1" },
      { outcome: 'show2', value: "D29 = 2 or 3, Please select D29 Equals '2' or '3'" },
      { outcome: 'show3', value: "Select ALL OTHERS" }
    ]
  },  
];

function dynamicVariables(questionPool, questionValues) {
  rules.forEach(rule => {
    const result = clauses[rule.variable](questionPool, questionValues);
    const condition = rule.conditions.find(cond => cond.outcome === result);
    if (condition) {
      window[rule.variable] = condition.value;
    } else {
      console.error(`No matching condition for outcome ${result} in variable ${rule.variable}`);
    }
  });

  // Trigger regeneration of affected questions
  Object.keys(questionPool).forEach(questionNumber => {
    regenerateQuestions(questionNumber);
  });
}

function regenerateQuestions(questionNumber) {
  const questionElement = document.querySelector(`[data-question="${questionNumber}"]`);

  if (!questionElement) {
    console.error(`regenerateQuestions: No element found for question ${questionNumber}`);
    return;
  }

  // Retrieve the original question text from questions.question
  const originalQuestionText = questions.find(q => q.number === questionNumber).question;

  // Check for dynamic variables in the question text and replace them with their current values
  let updatedQuestionText = originalQuestionText.replace(/{([^}]*)}/g, (variable) => {
    return eval(variable); // Safely evaluate the variable
  });

  // Update the question label in the DOM
  const label = questionElement.querySelector('label');
  if (label) {
    label.innerHTML = `<strong>Question ${questionNumber}</strong>: ${updatedQuestionText}`;
  } else {
    console.error(`regenerateQuestions: No label found for question ${questionNumber}`);
  }
}


questions.forEach((q) => {
  questionContainer.innerHTML += generateQuestion(
    q.number,
    q.question,
    q.inputType,
    q.options,
    q.trigger
  );
});

function updateQuestionPool(questionNumber) {
  questionValues = storeQuestionValues();

  const questionElement = document.querySelector(
    `[data-question="${questionNumber}"]`
  );
  if (questionElement === null) {
    console.error("updateQuestionPool: questionElement is null", {
      questionNumber,
    });
    return;
  }

  const inputType = questionElement.querySelector("select")
    ? "select"
    : questionElement.querySelector('input[type="text"]')
    ? "response"
    : questionElement.querySelector('input[type="checkbox"]')
    ? "checkbox"
    : questionElement.querySelector(".display-text")
    ? "display"
    : "radio";

  let selectedOptions = [];
  if (inputType === "radio") {
    selectedOptions = Array.from(
      document.querySelectorAll(`[name="question${questionNumber}"]:checked`)
    ).map((option) => option.getAttribute("data-trigger"));
  } else if (inputType === "checkbox") {
    selectedOptions = Array.from(
      document.querySelectorAll(
        `[data-question="${questionNumber}"] input:checked`
      )
    ).map((option) => option.getAttribute("data-trigger"));
  } else if (inputType === "response") {
    const responseInput = document.querySelector(
      `[data-question="${questionNumber}"] input[type="text"]`
    );
    const radioInput = document.querySelector(
      `[data-question="${questionNumber}"] input[type="radio"]:checked`
    );

    if (responseInput.value !== '') {
        selectedOptions = [responseInput.getAttribute("data-trigger")];
    } else if (radioInput) {
        selectedOptions = [radioInput.getAttribute("data-trigger")];
    } else {
        selectedOptions = [];
    }
    // for default case where same trigger is specified for all options in the question
    if (selectedOptions[0] === null) {
      selectedOptions = [responseInput.getAttribute("data-trigger")];
    }

  } else if (inputType === "display") {
    selectedOptions = Array.from(
      document.querySelectorAll(
        `[data-question="${questionNumber}"] button.proceed-btn`
      )
    ).map((option) => option.getAttribute("data-trigger"));
  } else {
    // select a.k.a dropdown
    selectedOptions = Array.from(
      document.querySelectorAll(
        `[data-question="${questionNumber}"] option:checked`
      )
    ).map((option) => option.getAttribute("data-trigger"));
  }

  questionPool[questionNumber] = selectedOptions.filter((option) => option);
  for (const option of selectedOptions) {
    questionPool[option] = [];
  }

  // Check if any conditional question should be added to the question pool
  for (const question in conditionalQuestions) {
    let conditionMet = true;
    if (conditionalQuestions[question].slice(-1)[0] == 'or') {
      conditionMet = false;
      for (const condition of conditionalQuestions[question]) {
        if (condition === 'or') { continue; } // skip tag as it's not a conditional question
        let [conditionQuestion, conditionValues, option] = condition;
        conditionValues = conditionValues.map((val) => val.toString()); // parse the condition values to string to match with query selectors string type
        // select from all question types
        const selectedRadio = questionContainer.querySelector(
          `[data-question="${conditionQuestion}"] input[type="radio"]:checked`
        );
        const selectedCheckbox = questionContainer.querySelectorAll(
          `[data-question="${conditionQuestion}"] input[type="checkbox"]:checked`
        );
        const selectedResponse = questionContainer.querySelector(
          `[data-question="${conditionQuestion}"] input[type="text"]`
        );
        const selectedDropdown = questionContainer.querySelector(
          `[data-question="${conditionQuestion}"] option:checked`
        );

        // combine all non-null values into array
        const selectedOptions = [
          selectedRadio && selectedRadio.value,
          ...(selectedCheckbox
            ? Array.from(selectedCheckbox).map((checkbox) => checkbox.value)
            : []),
          selectedResponse && selectedResponse.value,
          selectedDropdown && selectedDropdown.value,
        ].filter((option) => option !== undefined && option !== null);

        if (option === "or") {
          // any value in conditionValues is in selectedOptions
          conditionMet = conditionValues.some((val) =>
            selectedOptions.includes(val)
          );
          conditionMet = true;
          continue;
        } else if (
          conditionValues.some((val) => val.startsWith("~")) &&
          (!selectedOptions.includes("") || !selectedOptions.includes(''))
        ) {
          // slice out any '~' value in conditionValues
          conditionValues = conditionValues.map((val) => val.replace("~", ""));
          // any value in conditionValues is not in selectedOptions
          conditionMet = conditionValues.every(
            (val) => !selectedOptions.includes(val)
          );
        } else if (
          conditionValues.every((val) => selectedOptions.includes(val))
        ) {
          conditionMet = true;
        }
      }
      
    } else {
        for (const condition of conditionalQuestions[question]) {
          if (!conditionMet) { break; } // continue to next condition if condition is not met
          let [conditionQuestion, conditionValues, option] = condition;
          conditionValues = conditionValues.map((val) => val.toString()); // parse the condition values to string to match with query selectors string type
          // select from all question types
          const selectedRadio = questionContainer.querySelector(
            `[data-question="${conditionQuestion}"] input[type="radio"]:checked`
          );
          const selectedCheckbox = questionContainer.querySelectorAll(
            `[data-question="${conditionQuestion}"] input[type="checkbox"]:checked`
          );
          const selectedResponse = questionContainer.querySelector(
            `[data-question="${conditionQuestion}"] input[type="text"]`
          );
          const selectedDropdown = questionContainer.querySelector(
            `[data-question="${conditionQuestion}"] option:checked`
          );

          // combine all non-null values into array
          const selectedOptions = [
            selectedRadio && selectedRadio.value,
            ...(selectedCheckbox
              ? Array.from(selectedCheckbox).map((checkbox) => checkbox.value)
              : []),
            selectedResponse && selectedResponse.value,
            selectedDropdown && selectedDropdown.value,
          ].filter((option) => option !== undefined && option !== null);

          if (option === "or") {
            // any value in conditionValues is in selectedOptions
            conditionMet = conditionValues.some((val) =>
              selectedOptions.includes(val)
            );
          } else if (
            conditionValues.some((val) => val.startsWith("~")) &&
            (!selectedOptions.includes("") || !selectedOptions.includes(''))
          ) {
            // slice out any '~' value in conditionValues
            conditionValues = conditionValues.map((val) => val.replace("~", ""));
            // any value in conditionValues is not in selectedOptions
            conditionMet = conditionValues.every(
              (val) => !selectedOptions.includes(val)
            );
          } else if (
            !conditionValues.every((val) => selectedOptions.includes(val))
          ) {
            conditionMet = false;
          }
        }
    }

    if (conditionMet || Object.values(questionPool).flat().includes(question)) {
      // if question does not exist in questionPool, add it
      if (!questionPool[question]) {
        compulsoryQuestions.push(question); // utilize compulsoryQuestions mechanism to ensure question won't get removed.
        questionPool[question] = [];
      }
    } else {
      compulsoryQuestions = compulsoryQuestions.filter((q) => q !== question);
      delete questionPool[question];
    }
  }

  // if any key in questionPool not in compulsoryQuestions or value of questionPool, drop it
  for (const key in questionPool) {
    if (
      !compulsoryQuestions.includes(key) &&
      !Object.values(questionPool).flat().includes(key)
    ) {
      delete questionPool[key];
    }
  }

  // compare questionPool with lagQuestionPool to check what questions are removed or added
  const removedQuestions = Object.keys(lagQuestionPool)
    .flat()
    .filter((question) => !Object.keys(questionPool).includes(question));
  const addedQuestions = Object.keys(questionPool)
    .flat()
    .filter(
      (question) => !Object.keys(lagQuestionPool).flat().includes(question)
    );

  // edit the DOM to reflect the changes
  removedQuestions.forEach((question) => {
    // add d-none to the question and clear selection if any
    const questionElement = document.querySelector(
      `[data-question="${question}"]`
    );
    if (questionElement) {
      questionElement.classList.add("d-none");

      // Clear selection for removed question
      const select = questionElement.querySelector("select");
      const responseInput = questionElement.querySelector('input[type="text"]');
      const checkboxes = questionElement.querySelectorAll('input[type="checkbox"]');
      const radioButtons = questionElement.querySelectorAll('input[type="radio"]');

      // Reset select input
      if (select) {
        select.selectedIndex = 0; // Reset select to default option
      }

      // Reset text input
      if (responseInput) {
        responseInput.value = "";
      }

      // Reset checkbox inputs
      checkboxes.forEach((checkbox) => {
        checkbox.checked = false;
      });

      // Reset radio button inputs
      radioButtons.forEach((radioButton) => {
        radioButton.checked = false;
      });

    } else {
      console.error(
        "updateQuestionPool: questionElement for removed question is null",
        { question }
      );
    }
  });
  addedQuestions.forEach((q) => {
    // remove d-none from the question
    const questionElement = document.querySelector(`[data-question="${q}"]`);
    if (questionElement) {
      questionElement.classList.remove("d-none");
    } else {
      console.error(
        "updateQuestionPool: questionElement for added question is null",
        { question: q }
      );
    }
  });

  dynamicVariables(questionPool, questionValues);
  lagQuestionPool = { ...questionPool };
}

function handleQuestionChange(event) {
  const target = event.target;
  const questionElement = target.closest(".question");
  if (questionElement === null) {
    console.error("handleQuestionChange: questionElement is null", { target });
    return;
  }
  const questionNumber = questionElement.getAttribute("data-question");
  updateQuestionPool(questionNumber);
}

// Event listener for radio box clear button in response type question
document.addEventListener("click", function (event) {
  if (event.target.classList.contains("clear-radio")) {
    const questionElement = event.target.closest(".question");
    if (questionElement === null) {
      console.error("clear-radio click handler: questionElement is null", {
        target: event.target,
      });
      return;
    }
    const questionNumber = questionElement.getAttribute("data-question");
    document
      .querySelectorAll(`[name="question${questionNumber}"]`)
      .forEach((input) => {
        if (input.type === "radio") {
          input.checked = false;
        }
        // update question
        updateQuestionPool(questionNumber);
      });
  }
  if (event.target.classList.contains("proceed-btn")) {
    const trigger = event.target.getAttribute("data-trigger");
    const questionElement = event.target.closest(".question");
    if (questionElement === null) {
      console.error("proceed-btn click handler: questionElement is null", {
        target: event.target,
      });
      return;
    }
    const questionNumber = questionElement.getAttribute("data-question");
    updateQuestionPool(questionNumber);
  }
});

// Event listener for response input and radio box inputs
document.addEventListener("change", function (event) {
  const target = event.target;
  if (target && target.matches('.response-input input[type="text"]')) {
    const questionElement = target.closest(".question");
    if (questionElement === null) {
      console.error("response-input change handler: questionElement is null", {
        target,
      });
      return;
    }
    const questionNumber = questionElement.getAttribute("data-question");
    // Clear radio box inputs
    document
      .querySelectorAll(`[name="question${questionNumber}"]:checked`)
      .forEach((input) => {
        input.checked = false;
      });
  } else if (target && target.matches('.response-input input[type="radio"]')) {
    // Clear radio box for response-type
    const questionElement = target.closest(".question");
    if (questionElement === null) {
      console.error("radio input change handler: questionElement is null", {
        target,
      });
      return;
    }
    const questionNumber = questionElement.getAttribute("data-question");
    // Clear text input
    const responseInput = document.getElementById(`q${questionNumber}response`);
    if (responseInput) {
      responseInput.value = "";
    } else {
      console.error("radio input change handler: responseInput is null", {
        questionNumber,
      });
    }
  } else if (
    target &&
    target.matches('.response-input input[type="checkbox"]')
  ) {
    const questionElement = target.closest(".question");
    if (questionElement === null) {
      console.error("checkbox input change handler: questionElement is null", {
        target,
      });
      return;
    }
    const questionNumber = questionElement.getAttribute("data-question");
    // Clear text input
    const responseInput = document.getElementById(`q${questionNumber}response`);
    if (responseInput) {
      responseInput.value = "";
    } else {
      console.error("checkbox input change handler: responseInput is null", {
        questionNumber,
      });
    }
  }
});

document.getElementById("questionForm").addEventListener("submit", function (event) {
  event.preventDefault(); // Prevent default form submission
  var confirmationCheckbox = document.getElementById("confirmationCheckbox");
  if (!confirmationCheckbox.checked) {
    alert("Please confirm that your answers are correct before submitting.");
    return; // Prevent form submission if the checkbox is not checked
  }

  questionValues = storeQuestionValues();

  let openInNewTab = document.getElementById('newTabCheckbox').checked;
  if (openInNewTab) {
    let URL = "results.html?data="
    window.open(URL + encodeURIComponent(JSON.stringify(questionValues)));
    
  } else {
    var ID = prompt("Please enter ID:");
    if (ID === null) {
      return
    }
    if (ID) {
      // strip any -_ characters from ID
      ID = ID.replace(/-_/g, "");
    }

    if (ID === undefined || ID === null || ID === "") {
      // randomly assign ID
      ID = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }
    timestamp = new Date().toISOString();
    // Store the form data, name, and ID in localStorage
    var userData = {
      ID: ID,
      Timestamp: timestamp,
      FormData: questionValues
    };

    localStorage.setItem(ID + "-_" + timestamp, JSON.stringify(userData));
    window.location.href = "results.html";
  }
});

document.getElementById("loadingOverlay").style.display = "none"; // Hide the loading after page is loaded
