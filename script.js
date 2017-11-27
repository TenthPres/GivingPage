var undesignatedElement = {
    "name": "No Preference"
};


var scripts = document.getElementsByTagName('script'),
    req = new XMLHttpRequest();

// parameters for the XHR
req.Timeout = 4000;
req.withCredentials = true;
req.container = scripts[scripts.length - 1].parentNode;
req.addEventListener('load', createFormFromLoadedJson);
req.open("GET", "funds.json");
req.send();

function createFormFromLoadedJson() {
    var funds = JSON.parse(this.responseText),
        form = document.createElement("form"),
        addFundBtn = document.createElement('a'),
        giveBtn = document.createElement('a'),
        fieldsetContainer = document.createElement('div'),
        totals = document.createElement("span");

    // Form setup
    this.container.appendChild(form);
    form.action = "#";
    form.appendChild(fieldsetContainer);
    insertUndesignateds(funds);

    // "Add" Button
    addFundBtn.className = "btn btn-primary";
    addFundBtn.innerHTML = "Add";
    addFundBtn.onclick = addDonationFieldset;
    form.appendChild(addFundBtn);

    // Total section
    totals.id = "giving_totalLine";
    totals.innerHTML = "&nbsp;";
    form.appendChild(totals);

    // "Give Now" Button
    giveBtn.className = "btn btn-primary";
    giveBtn.innerHTML = "Give Now";
    form.appendChild(giveBtn);


    // Populate the initial fieldset
    addDonationFieldset();

    function addDonationFieldset() {
        var select = document.createElement("select"),
            fieldset = document.createElement("fieldset"),
            selects = document.createElement("div"),
            memo = document.createElement("input"),
            amount = document.createElement("input");

        // configure the memo input
        memo.type = "text";
        memo.placeholder = "Memo (optional)";
        memo.classList.add("giving_memo");

        // configure the amount input & span
        amount.type = "number";
        amount.setAttribute("step", "0.01");
        amount.style.textAlign = "right";
        amount.placeholder = "Amount to give";
        amount.onchange = setTwoNumberDecimal;
        amount.classList.add("giving_fundAmount");
        amount.required = true;

        // place the stuff on the page
        selects.appendChild(select);
        fieldset.appendChild(selects);
        fieldset.appendChild(memo);
        fieldset.appendChild(amount);
        fieldset.classList.add("giving");
        fieldsetContainer.appendChild(fieldset);
        addFundsToSelect(funds, select);

        // function for making money appear with proper spacing for cents.
        function setTwoNumberDecimal() {
            var n = parseFloat(this.value.replace("$",""));
            if (isNaN(n) || n <= 0) {
                this.value = null;
            } else {
                this.value = n.toFixed(2);
            }
            calcTotals();
        }
    }

    function calcTotals() {
        var inputs = document.getElementsByClassName("giving_fundAmount"),
            total = 0;

        for (var i = 0; i < inputs.length; i++) {
            var t = parseFloat(inputs[i].value);
            if (!isNaN(t)) {
                total += t;
            }
        }

        totals.innerHTML = "Total: $ " + total.toFixed(2);
    }

    function insertUndesignateds(funds) {
        if (funds !== undefined && funds.length > 1) {
            funds.unshift(undesignatedElement);
            funds.forEach(function(fi) {
                if (fi.sub !== undefined) {
                    insertUndesignateds(fi.sub);
                }
            });
        }
    }

    function addFundsToSelect(funds, select) {
        funds.forEach(function(fund) {
            var o = document.createElement("option");
            o.innerHTML = fund.name;

            // store sub-funds in the "sub" property of the option.
            if (fund.hasOwnProperty("sub")) {
                o.sub = fund.sub;
            }

            // add the option to the select elt
            select.appendChild(o);
        });

        // designate the handler, and execute it for the initial selection.
        select.onchange = handleFundSelection;
        select.onchange();
    }

    function handleFundSelection() {
        var selectElt = this,
            selectedO = selectElt.options[selectElt.selectedIndex];

        removeSubSelects(selectElt);

        if (selectedO.sub !== undefined) {
            selectElt.subSel = document.createElement('select');
            selectElt.parentNode.appendChild(selectElt.subSel);
            addFundsToSelect(selectedO.sub, selectElt.subSel);
        }

        function removeSubSelects(selectElt) {
            if (selectElt.subSel !== undefined) {
                removeSubSelects(selectElt.subSel);
                selectElt.subSel.parentNode.removeChild(selectElt.subSel);
                selectElt.subSel = undefined;
            }
        }
    }
}




