"use strict";
const endpoint = "https://us-central1-sudoku42xyz.cloudfunctions.net/waitlist";
const translate = window.sudoku42T || ((key) => key);
const campaign = new URL("https://sudoku42.com/iOS/");
campaign.searchParams.set("utm_source", "friend");
campaign.searchParams.set("utm_campaign", "ios_waitlist");
const campaignUrl = campaign.href;
const shareText = translate("shareText");
const form = document.getElementById("waitlist-form");
const formStatus = document.getElementById("form-status");
const joinButton = document.getElementById("join-button");
const shareStatus = document.getElementById("share-status");
const shareInput = document.getElementById("share-url");
const shareFallback = document.getElementById("share-fallback");
const emailShare = document.getElementById("email-share");
const signup = document.getElementById("signup");
const success = document.getElementById("success");
const sharing = document.getElementById("sharing");
const resetWaitlist = document.getElementById("reset-waitlist");
const signupCompleteKey = "sudoku42-ios-waitlist-joined";
shareInput.value = campaignUrl;
emailShare.href = `mailto:?subject=${encodeURIComponent("sudoku42 for iPhone & iPad")}&body=${encodeURIComponent(`${shareText}\n\n${campaignUrl}`)}`;
function deviceFamily() {
  const userAgent = navigator.userAgent;
  if (/iPad/.test(userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) return "ipad";
  if (/iPhone/.test(userAgent)) return "iphone";
  if (/Android/.test(userAgent)) return "android";
  if (/Mobi/.test(userAgent)) return "other";
  return "desktop";
}
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
  joinButton.textContent = translate("joining");
  formStatus.classList.remove("error");
  formStatus.textContent = translate("signingUp");
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
        deviceFamily: deviceFamily(),
      } }),
    });
    if (!response.ok) {
      if (response.status === 429) throw new Error(translate("busy"));
      if (response.status === 400) throw new Error(translate("invalidEmail"));
      throw new Error(translate("saveFailed"));
    }
    const { result } = await response.json();
    if (result?.ok !== true) throw new Error(translate("saveFailed"));
    localStorage.setItem(signupCompleteKey, "true");
    showConfirmation(true);
    form.reset();
    document.getElementById("success-title").focus();
  } catch (error) {
    formStatus.classList.add("error");
    formStatus.textContent = error.name === "AbortError" ? translate("timeout") : error.message;
  } finally {
    clearTimeout(timeout);
    joinButton.disabled = false;
    joinButton.textContent = translate("join");
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
    shareStatus.textContent = translate("copied");
  } catch {
    showShareFallback();
    shareStatus.textContent = translate("selectCopy");
  }
});
