class Output {
  constructor(outputId = "sound") {
    this.outputId = outputId
  }
  addClassOutput(parentEl, classId = "", classOutput="") {
    let container = document.createElement("div");
    container.classList.add("output__led-class");
    container.classList.add(`output__led-class--${id}`);

    container.LEDIcon = classOutput;

    let editIcon = document.createElement("div");
    let editLabel = document.createElement("label");
    editLabel.classList.add("output__edit-label");
    editLabel.innerText = GLOBALS.i18n.t("output-section-led-edit-label")
    editIcon.classList.add("output__led-edit");
    editIcon.classList.add(`output__led-edit--${id}`);
    editIcon.appendChild(editLabel);

    let input = document.createElement("input");
    input.classId = id;
    input.classList.add("output__led-input");
    input.classList.add(`output__led-input--${id}`);
    input.setAttribute("readonly", "readonly");
    input.value = GLOBALS.i18n.t(
        classOutput === null 
            ? "output-section-led-option-label-nothing"
            : `output-section-led-option-label-${classOutput}`
    ) 
    
    container.appendChild(editIcon);
    container.appendChild(input);

    container.input = input;
    this.inputClasses[index] = container;
    parentEl.appendChild(container);
  }
}