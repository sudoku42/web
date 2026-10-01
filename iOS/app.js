"use strict";
const endpoint = "https://us-central1-sudoku42xyz.cloudfunctions.net/iosWaitlist";
const campaignUrl = "https://sudoku42.com/iOS/?utm_source=friend&utm_campaign=ios_waitlist";
const shareText = "Sudoku42 is coming to iPhone and iPad. Join the waitlist to hear when it’s ready.";
const form = document.getElementById("waitlist-form");
const formStatus = document.getElementById("form-status");
const joinButton = document.getElementById("join-button");
const shareStatus = document.getElementById("share-status");
const shareInput = document.getElementById("share-url");
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (joinButton.disabled || !form.reportValidity()) return;
  joinButton.disabled = true;
  joinButton.textContent = "Joining…";
  formStatus.classList.remove("error");
  formStatus.textContent = "Signing up…";
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const params = new URLSearchParams(window.location.search);
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        email: form.elements.email.value.trim(),
        website: form.elements.website.value,
        consent: true,
        source: params.get("utm_source") || "direct",
      }),
    });
    if (!response.ok) {
      if (response.status === 429) throw new Error("Too many attempts. Please try again in an hour.");
      if (response.status === 400) throw new Error("Please check your email address and try again.");
      throw new Error("We couldn’t save your signup. Please try again in a moment.");
    }
    document.getElementById("signup").hidden = true;
    document.getElementById("success").hidden = false;
    form.reset();
    document.getElementById("success-title").focus();
  } catch (error) {
    formStatus.classList.add("error");
    formStatus.textContent = error.name === "AbortError" ? "That took too long. Please try again." : error.message;
  } finally {
    clearTimeout(timeout);
    joinButton.disabled = false;
    joinButton.textContent = "Join the waitlist";
  }
});
function showShareFallback() {
  document.getElementById("share-fallback").hidden = false;
  shareInput.focus();
  shareInput.select();
}
async function share() {
  shareStatus.textContent = "";
  if (navigator.share) {
    try {
      await navigator.share({ title: "Sudoku42 for iOS", text: shareText, url: campaignUrl });
      return;
    } catch (error) {
      if (error.name === "AbortError") return;
    }
  }
  showShareFallback();
}
document.getElementById("share-button").addEventListener("click", share);
document.getElementById("copy-button").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(campaignUrl);
    shareStatus.textContent = "Link copied.";
  } catch {
    showShareFallback();
    shareStatus.textContent = "Select and copy the link above to share it.";
  }
});
