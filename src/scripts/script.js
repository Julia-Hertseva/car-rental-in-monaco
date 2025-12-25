"use strict";
window.onload = function () {
  document.getElementById("burger").onclick = function () {
    document.getElementById("menu").classList.add("menu__open");
    document.querySelector("header").classList.add("header__bg");
  };

  document.querySelectorAll("#menu *").forEach(item => {
    item.onclick = () => {
      document.getElementById("menu").classList.remove("menu__open");
      document.querySelector("header").classList.remove("header__bg");
    };
  });

  // WOW animation
  new WOW({
    animateClass: "animate__animated",
  }).init();

  const letterSpacing = getComputedStyle(
    document.querySelector(":root")
  ).getPropertyValue("--letter-spacing-x");

  let cursor = document.querySelector(".cursor");
  let cursorLink = document.querySelector(".link");
  let cursorIcon = document.querySelector(".icon");

  let iconMap = {
    main: "fa-house",
    carPark: "fa-car-side",
    condition: "fa-bell",
    contacts: "fa-envelope",
  };

  document.addEventListener("mousemove", event => {
    cursor.style.left = event.pageX - cursor.offsetWidth / 4 + "px";
    cursor.style.top = event.pageY - cursor.offsetHeight / 4 + "px";

    cursor.classList.remove("active");
    cursorLink.innerHTML = "";
    cursorIcon.innerHTML = "";

    let elements = document.elementsFromPoint(event.clientX, event.clientY);
    elements.forEach(elem => {
      if (elem.tagName == "A") {
        cursor.classList.add("active");

        elem.innerHTML.split("").forEach((letter, i) => {
          let circleLetter = document.createElement("div");
          circleLetter.classList.add("circle-letter");
          circleLetter.innerHTML = letter;
          circleLetter.style.transform = "rotate(" + i * letterSpacing + "deg)";

          let circleLetterBottom = document.createElement("div");
          circleLetterBottom.classList.add("circle-letter-bottom");
          circleLetterBottom.innerHTML = letter;
          circleLetter.appendChild(circleLetterBottom);

          cursorLink.appendChild(circleLetter);
        });

        if (iconMap[elem.getAttribute("data-icon")]) {
          let circleIcon = document.createElement("i");
          circleIcon.classList.add("fa");
          circleIcon.classList.add(iconMap[elem.getAttribute("data-icon")]);
          cursorIcon.appendChild(circleIcon);
        }
      }
    });
  });

  document.addEventListener("mouseleave", event => {
    cursor.style.opacity = 0;
  });
  document.addEventListener("mouseenter", event => {
    cursor.style.opacity = 1;
  });

  // Scroll to top button
  const btn = $("#button");
  $(window).scroll(function () {
    if ($(window).scrollTop() > 300) {
      btn.addClass("show");
    } else {
      btn.removeClass("show");
    }
  });
  btn.on("click", function (e) {
    e.preventDefault();
    $("html, body").animate({ scrollTop: 0 }, "300");
  });

  // Forms
  let btnPhoneForm = $(".callback__btn");
  let btnForm = $(".form__btn");
  let btnRental = $(`.slider__btn`);
  let callbackForm = $(`.callback`);
  let orderForm = $(".order");
  let success = $(".order__form--success");

  btnPhoneForm.on("click", function () {
    callbackForm.css("display", "block");
  });

  btnForm.on("click", function () {
    orderForm.css("display", "block");
  });

  btnRental.on("click", function () {
    $("html, body").animate(
      {
        scrollTop: $(`.rental`).offset().top,
      },
      1000
    );
    orderForm.css("display", "block");

    $(`.card-name`).removeClass("selected");
    $(this).prev().children().addClass("selected");
    $(`#selectCar`).val($(this).prev().children().data("product"));
  });

  // Callback form
  let loader = $(`.loader`);
  let callbackName = $(`#callback-name`);
  let callbackPhone = $(`#callback-phone`);
  callbackPhone.mask("(000) 000-0000");
  $(`#callback-button`).on(`click`, function () {

    $(`.error-input`).hide();
    let hasErrorFirstForm = false;

    if (!callbackName.val().trim()) {
      callbackName.next().show();
      hasErrorFirstForm = true;
    } else if (callbackName.val().trim().length < 2) {
      alert("Please enter at least 2 characters for your name!");
      hasErrorFirstForm = true;
    }

    if (!callbackPhone.val()) {
      callbackPhone.next().show();
      hasErrorFirstForm = true;
    }

    if (!hasErrorFirstForm) {
      loader.css("display", "flex");

      $.ajax({
        method: "POST",
        url: "https://jsonplaceholder.typicode.com/posts",
        data: { name: callbackName.val(), phone: callbackPhone.val() },
      })
        .done(function () {
          loader.hide();
          $(".callback__form").hide();
          success.css("display", "flex");
          callbackName.val("");
          callbackPhone.val("");

          setTimeout(function () {
            success.hide();
            callbackForm.hide();
          }, 3000);
        })
        .fail(function () {
          loader.hide();
          alert("An error occurred. Please try again.");
        });
    }
  });

  let finishPicker;

  const startPicker = flatpickr("#start", {
    dateFormat: "Y-m-d",
    minDate: "today",
    onChange: function (selectedDates, dateStr) {

      finishPicker.set("minDate", dateStr);

      const endValue = document.querySelector("#finish").value;
      if (endValue && endValue < dateStr) {
        document.querySelector("#finish").value = "";
      }
    },
  });

  finishPicker = flatpickr("#finish", {
    dateFormat: "Y-m-d",
    minDate: "today",
  });

  // Order form
  let selectCar = $(`#selectCar`);
  let startDate = $(`#start`);
  let finishDate = $(`#finish`);
  let startCity = $(`#start-city`);
  let name = $(`#name`);
  let phoneNumber = $(`#phone-number`);
  let email = $(`#email`);

  phoneNumber.mask("(000) 000-0000");
  const EMAIL_REGEXP = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  $(`#form-button`).on(`click`, function (event) {
    event.preventDefault();

    $(`.error-input`).hide();
    let hasError = false;

    let selectedCar = $(`#selectCar option:selected`).html();
    let selectedCity = $(`#start-city option:selected`).text();

    if (selectedCar === `Select a car`) {
      selectCar.next().show();
      hasError = true;
    }
    if (!startDate.val()) {
      startDate.next().show();
      hasError = true;
    }
    if (!finishDate.val()) {
      finishDate.next().show();
      hasError = true;
    }
    if (selectedCity === `Where are you traveling from?`) {
      startCity.next().show();
      hasError = true;
    }
    if (!name.val().trim()) {
      name.next().show();
      hasError = true;
    } else if (name.val().trim().length < 2) {
      name.next().text("Name must be at least 2 characters").show();
      hasError = true;
    }
    if (!phoneNumber.val()) {
      phoneNumber.next().show();
      hasError = true;
    }
    if (!email.val()) {
      email.next().show();
      hasError = true;
    } else if (!EMAIL_REGEXP.test(email.val())) {
      email.next().text("Please enter a valid email address").show();
      hasError = true;
    }

    if (!hasError) {
      loader.css("display", "flex");

      $.ajax({
        method: "POST",
        url: "https://jsonplaceholder.typicode.com/posts",
        data: {
          car: selectCar.val(),
          date_of_start: startDate.val(),
          date_of_finish: finishDate.val(),
          city: startCity.val(),
          name: name.val(),
          phone: phoneNumber.val(),
          email: email.val(),
        },
      })
        .done(function () {
          loader.hide();
          $(".order__form").hide();
          success.css("display", "flex");

          selectCar.val("0");
          startDate.val("");
          finishDate.val("");
          startCity.prop("selectedIndex", 0);
          name.val("");
          phoneNumber.val("");
          email.val("");
          $("#message").val("");

          setTimeout(function () {
            success.hide();
            orderForm.hide();
          }, 3000);
        })
        .fail(function () {
          loader.hide();
          alert("An error occurred. Please try again.");
        });
    }
  });

  // Sliders
  $(".slider").slick({
    infinite: true,
    speed: 500,
    fade: true,
    adaptiveHeight: true,
    cssEase: "linear",
  });

  $(".slider-clients").slick({
    infinite: true,
    dots: true,
    slidesToShow: 3,
    slidesToScroll: 1,
    speed: 500,
    cssEase: "linear",
    responsive: [
      {
        breakpoint: 805,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
        },
      },
      {
        breakpoint: 680,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  });

  $(document).mouseup(function (e) {
    const container = $(".order__form, .callback__form");

    if (
      !container.is(e.target) &&
      container.has(e.target).length === 0 &&
      $(e.target).closest(".flatpickr-calendar").length === 0
    ) {
      orderForm.hide();
      callbackForm.hide();
    }
  });

  $(document).keyup(function (e) {
    if (e.key === "Escape") {
      orderForm.hide();
      callbackForm.hide();
    }
  });
};
