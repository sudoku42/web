"use strict";
const endpoint = "https://us-central1-sudoku42xyz.cloudfunctions.net/waitlist";
const translate = window.sudoku42T || ((key) => key);
const campaign = new URL("https://sudoku42.com/iOS/");
campaign.searchParams.set("utm_source", "friend");
campaign.searchParams.set("utm_campaign", "ios_waitlist");
const campaignUrl = campaign.href;
const isPreviewPage = document.body.dataset.sharePage === "preview";
const shareUrl = isPreviewPage
  ? document.querySelector('link[rel="canonical"]')?.href || window.location.href
  : campaignUrl;
const shareText = translate(isPreviewPage ? "sharePreviewText" : "shareText");
const shareTitle = isPreviewPage ? "Preview sudoku42 for iPhone & iPad" : "sudoku42 for iPhone & iPad";
const form = document.getElementById("waitlist-form");
const formStatus = document.getElementById("form-status");
const joinButton = document.getElementById("join-button");
const signup = document.getElementById("signup");
const success = document.getElementById("success");
const sharing = document.getElementById("sharing");
const postSignupActions = document.getElementById("post-signup-actions");
const resetWaitlist = document.getElementById("reset-waitlist");
const signupCompleteKey = "sudoku42-ios-waitlist-joined";
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
  postSignupActions.hidden = false;
  if (focus) document.getElementById("success-title").focus();
}
if (form && localStorage.getItem(signupCompleteKey) === "true") showConfirmation();
resetWaitlist?.addEventListener("click", () => {
  localStorage.removeItem(signupCompleteKey);
  signup.hidden = false;
  success.hidden = true;
  sharing.hidden = true;
  postSignupActions.hidden = true;
  form.reset();
  formStatus.classList.remove("error");
  formStatus.textContent = "";
  document.querySelectorAll(".share-fallback").forEach((fallback) => { fallback.hidden = true; });
  document.querySelectorAll(".share-status").forEach((status) => { status.textContent = ""; });
  form.elements.email.focus();
});
form?.addEventListener("submit", async (event) => {
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
        locale: window.sudoku42Locale,
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
function showShareFallback(component) {
  const fallback = component.querySelector(".share-fallback");
  const input = component.querySelector(".share-url");
  fallback.hidden = false;
  input.focus();
  input.select();
}
async function share(component) {
  const status = component.querySelector(".share-status");
  status.textContent = "";
  if (navigator.share) {
    try {
      await navigator.share({ title: shareTitle, text: shareText, url: shareUrl });
      return;
    } catch (error) {
      if (error.name === "AbortError") return;
    }
  }
  showShareFallback(component);
}
document.querySelectorAll(".share-button").forEach((button, index) => {
  const component = button.closest(".sharing, .share-compact");
  const input = component.querySelector(".share-url");
  const label = component.querySelector(".share-fallback label");
  const emailShare = component.querySelector(".email-share");
  input.id = `share-url-${index + 1}`;
  label.htmlFor = input.id;
  input.value = shareUrl;
  if (emailShare) emailShare.href = `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`;
  button.addEventListener("click", () => share(component));
  component.querySelector(".copy-button").addEventListener("click", async () => {
    const status = component.querySelector(".share-status");
    try {
      await navigator.clipboard.writeText(shareUrl);
      status.textContent = translate("copied");
    } catch {
      showShareFallback(component);
      status.textContent = translate("selectCopy");
    }
  });
});
