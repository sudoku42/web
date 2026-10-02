"use strict";
const endpoint = "https://us-central1-sudoku42xyz.cloudfunctions.net/waitlist";
const campaignUrl = "https://sudoku42.com/iOS/?utm_source=friend&utm_campaign=ios_waitlist";
const shareText = "sudoku42 is almost ready for iPhone and iPad. Join the waitlist to hear when it’s ready.";
const form = document.getElementById("waitlist-form");
const formStatus = document.getElementById("form-status");
const joinButton = document.getElementById("join-button");
const shareStatus = document.getElementById("share-status");
const shareInput = document.getElementById("share-url");
const shareFallback = document.getElementById("share-fallback");
const signup = document.getElementById("signup");
const success = document.getElementById("success");
const sharing = document.getElementById("sharing");
const resetWaitlist = document.getElementById("reset-waitlist");
const signupCompleteKey = "sudoku42-ios-waitlist-joined";
function showConfirmation(focus = false) {
  signup.hidden = true;
  success.hidden = false;
  sharing.hidden = false;
  if (focus) document.getElementById("success-title").focus();
}
if (localStorage.getItem(signupCompleteKey) === "true") showConfirmation();
resetWaitlist.addEventListener("click", () => {
  localStorage.removeItem(signupCompleteKey);
  signup.hidden = false;
  success.hidden = true;
  sharing.hidden = true;
  form.reset();
  formStatus.classList.remove("error");
  formStatus.textContent = "";
  shareFallback.hidden = true;
  shareStatus.textContent = "";
  form.elements.email.focus();
});
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
      body: JSON.stringify({ data: {
        email: form.elements.email.value.trim(),
        source: params.get("utm_source") || "direct",
      } }),
    });
    if (!response.ok) {
      if (response.status === 429) throw new Error("The server is busy. Please try again in a moment.");
      if (response.status === 400) throw new Error("Please check your email address and try again.");
      throw new Error("We couldn’t save your signup. Please try again in a moment.");
    }
    const { result } = await response.json();
    if (result?.ok !== true) throw new Error("We couldn’t save your signup. Please try again.");
    localStorage.setItem(signupCompleteKey, "true");
    showConfirmation(true);
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
  shareFallback.hidden = false;
  shareInput.focus();
  shareInput.select();
}
async function share() {
  shareStatus.textContent = "";
  if (navigator.share) {
    try {
      await navigator.share({ title: "sudoku42 for iPhone & iPad", text: shareText, url: campaignUrl });
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
