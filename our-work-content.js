import { createClient } from "https://esm.sh/@sanity/client";
import imageUrlBuilder from "https://esm.sh/@sanity/image-url";
import { projectTemplate } from "./portfolio-item.js";

const sanityClient = createClient({
  projectId: "4ie5mdlg",
  dataset: "production",
  useCdn: true,
  apiVersion: "v2022-03-07",
});

// Create an instance of the image URL builder
const builder = imageUrlBuilder(sanityClient);

// Helper function to generate image URLs
function urlFor(source) {
  return builder.image(source);
}

// Fetch projects from Sanity
sanityClient
  .fetch(
    `
  *[_type == "project"] | order(_createdAt asc){
    projectname,
    slug,
    client,
    location,
    testimonial,
    style,
    mainimage,
    gallery,
    "services": services[]->name
  }
`
  )
  .then(async (projects) => {
    const template = await loadTemplate(); // Load the template once

    projects.forEach((project, index) => {
      // Replace placeholders with actual project data
      const projectTemplate = template
        .replace(/{index}/g, index)
        .replace(/{mainImageUrl}/g, urlFor(project.mainimage.asset).url())
        .replace(/{projectName}/g, project.projectname)
        .replace(/{client}/g, project.client)
        .replace(/{location}/g, project.location)
        .replace(
          /{services}/g,
          project.services
            ? project.services
                .map((service) => `<div class="work-you-did">${service}</div>`)
                .join("")
            : ""
        )
        .replace(/{testimonial}/g, project.testimonial);

      // Append the generated template to a container
      document.querySelector(".portfolio_list").innerHTML += projectTemplate;

      // Attach event listener for modal trigger using event delegation
      $(".portfolio_list").on("click", ".portfolio_item", function (event) {
        event.preventDefault(); // Prevent default anchor behavior
        const index = $(this).data("index"); // Get the index of the clicked item
        const project = projects[index]; // Get the corresponding project data
        populateSlider(project); // Pass the current project to the slider function

        lenis.stop();

        $("body").css("overflow", "hidden");
      });
    });

    Webflow.require("ix2").init();
  });

$(".portfolio-slider-close-button").on("click", function (event) {
  dePopulateSlider();

  lenis.start();

  $("body").css("overflow", "auto");
});

// Function to populate the slider with images from the gallery and generate navigation dots
function populateSlider(currentProject) {
  const $sliderContainer = $(".slider-container");
  const $sliderIndicators = $(".slider-indicators");

  // Clear any existing slides and dots
  $sliderContainer.empty();
  $sliderIndicators.empty();

  // Load and append the main image as the first slide
  const mainImageUrl = urlFor(currentProject.mainimage.asset).url(); // Assuming mainImage is a field in currentProject
  const mainSlide = `
        <li>
            <div class="portfolio-slider-image_wrapper">
                <img src="${mainImageUrl}" alt="Main project image" class="portfolio-slider-image">
            </div>
        </li>
    `;
  const mainDot = `<li class="active"></li>`; // The main image dot is set as active

  // Append the main slide and its dot first
  $sliderContainer.append(mainSlide);
  $sliderIndicators.append(mainDot);

  // Populate slider with images from the gallery
  currentProject.gallery.forEach((image, index) => {
    const imageUrl = urlFor(image.asset).url();
    const slide = `
            <li>
                <div class="portfolio-slider-image_wrapper">
                    <img src="${imageUrl}" alt="Project image" class="portfolio-slider-image">
                </div>
            </li>
        `;
    const dot = `<li ${index === 0 ? "" : ""}></li>`; // Additional dots for gallery images

    // Append slide and dot
    $sliderContainer.append(slide);
    $sliderIndicators.append(dot);
  });

  // Reinitialize Swiffy Slider after populating it with dynamic content
  swiffyslider.init(); // This ensures the slider works properly after adding slides dynamically
}

async function loadTemplate() {
  const response = await fetch("project-template.html");
  return response.text(); // Fetch the template as a string
}

// Function to depopulate the slider with images from the gallery and generate navigation dots
function dePopulateSlider() {
  const $sliderContainer = $(".slider-container");
  const $sliderIndicators = $(".slider-indicators");

  // Clear any existing slides and dots
  $sliderContainer.empty();
  $sliderIndicators.empty();

  // Reinitialize Swiffy Slider after populating it with dynamic content
  swiffyslider.init(); // This ensures the slider works properly after adding slides dynamically
}
