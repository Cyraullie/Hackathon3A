// src/ui/PromptInput.ts
export function listenForPrompt(callback: (command: string) => void) {
  const input = document.createElement("input");
  input.placeholder = "Écris un prompt...";
  input.style.position = "absolute";
  input.style.bottom = "20px";
  input.style.left = "20px";
  document.body.appendChild(input);

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const text = input.value.trim().toUpperCase();
      input.value = "";
      callback(text);
    }
  });
}

