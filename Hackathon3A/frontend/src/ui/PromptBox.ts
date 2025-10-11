export function createPromptBox(onSend: (text: string) => void) {
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.bottom = "20px";
  container.style.right = "20px";
  container.style.width = "320px";
  container.style.background = "rgba(30, 30, 30, 0.95)";
  container.style.border = "1px solid #555";
  container.style.borderRadius = "12px";
  container.style.padding = "10px";
  container.style.boxShadow = "0 0 15px rgba(0,0,0,0.3)";
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.zIndex = "1000";
  container.style.backdropFilter = "blur(8px)";

  const title = document.createElement("div");
  title.innerText = "IA Prompt";
  title.style.fontWeight = "bold";
  title.style.color = "#fff";
  title.style.marginBottom = "6px";
  title.style.fontSize = "16px";

  const input = document.createElement("textarea");
  input.placeholder = "Décris ton intention ici...";
  input.style.flex = "1";
  input.style.minHeight = "60px";
  input.style.resize = "none";
  input.style.border = "none";
  input.style.borderRadius = "6px";
  input.style.padding = "6px";
  input.style.outline = "none";
  input.style.fontSize = "14px";
  input.style.background = "#222";
  input.style.color = "#fff";
  input.style.marginBottom = "6px";

  const sendBtn = document.createElement("button");
  sendBtn.innerText = "Envoyer";
  sendBtn.style.padding = "6px";
  sendBtn.style.borderRadius = "6px";
  sendBtn.style.border = "none";
  sendBtn.style.cursor = "pointer";
  sendBtn.style.background = "#4a90e2";
  sendBtn.style.color = "#fff";
  sendBtn.style.fontWeight = "bold";
  sendBtn.style.transition = "background 0.2s";
  sendBtn.onmouseenter = () => (sendBtn.style.background = "#357ABD");
  sendBtn.onmouseleave = () => (sendBtn.style.background = "#4a90e2");

  sendBtn.addEventListener("click", () => {
    const value = input.value.trim();
    if (value) {
		console.log("ce que l'user a rentrer: ", value)
      onSend(value);
      input.value = "";
    }
  });

  container.appendChild(title);
  container.appendChild(input);
  container.appendChild(sendBtn);

  document.body.appendChild(container);
}

