// Function to show the pop-up message with Cloudera logo and enhanced UI
function showPopup() {
    // Prevent multiple popups
    if (document.getElementById('cloudera-popup')) return;

    // Create the popup container
    let popup = document.createElement('div');
    popup.id = 'cloudera-popup';
    popup.style.position = 'fixed';
    popup.style.top = '50%';
    popup.style.left = '50%';
    popup.style.transform = 'translate(-50%, -50%)';
    popup.style.width = '350px';
    popup.style.padding = '20px';
    popup.style.zIndex = '10000'; // Make sure it's above everything
    popup.style.backgroundColor = '#fff';
    popup.style.borderRadius = '8px';
    popup.style.border = '1px solid #ccc';
    popup.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.1)';
    popup.style.fontFamily = 'Arial, sans-serif';
    popup.style.textAlign = 'center';

    // Add Cloudera logo
    let logo = document.createElement('img');
    logo.src = 'https://www.cloudera.com/content/dam/www/marketing/media-kit/logo-assets/cloudera_logo_darkorange.png'; // Cloudera logo URL
    logo.alt = 'Cloudera Logo';
    logo.style.width = '120px';  // Adjust size as needed
    logo.style.marginBottom = '15px';
    popup.appendChild(logo);

    // Title
    let title = document.createElement('h1');
    title.textContent = 'Action Blocked';
    title.style.fontSize = '20px';
    title.style.color = '#333';
    title.style.marginBottom = '15px';
    popup.appendChild(title);

    // Message
    let message = document.createElement('p');
    message.textContent = 'Select, Copy, Paste, Context Menu, Dragging Text, and Screenshot are not allowed on ';
    let code = document.createElement('code');
    code.textContent = 'github.infra.cloudera.com';
    code.style.fontWeight = 'bold';
    message.appendChild(code);
    message.style.fontSize = '14px';
    message.style.lineHeight = '1.6';
    message.style.color = '#666';
    popup.appendChild(message);

    // Append the popup to the body
    document.body.appendChild(popup);

    // Automatically remove the popup after 3 seconds
    setTimeout(() => {
        popup.remove();
    }, 3000);
}

// Function to create an overlay to deter screenshots
function showOverlay() {
    // Prevent multiple overlays
    if (document.getElementById('screenshot-overlay')) return;

    let overlay = document.createElement('div');
    overlay.id = 'screenshot-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)'; // Dark overlay
    overlay.style.zIndex = '9999'; // Make sure it's on top
    overlay.style.pointerEvents = 'none'; // Allow interaction beneath

    document.body.appendChild(overlay);

    // Set timeout to remove the overlay after 3 seconds
    setTimeout(() => {
        removeOverlay();
        showPopup(); // Show the pop-up after removing the overlay
    }, 3000);
}

// Function to remove the overlay
function removeOverlay() {
    let overlay = document.getElementById('screenshot-overlay');
    if (overlay) {
        overlay.remove();
    }
}

// Function to handle restricted actions (select, copy, cut, etc.)
function handleRestrictedAction(e) {
    e.preventDefault(); // Block the action
    showPopup(); // Show the pop-up
}

// Function to handle copy button click and block the copy operation
function handleCopyButtonClick(e) {
    e.preventDefault(); // Prevent the default copy action
    showPopup(); // Show the pop-up

    // Prevent clipboard interaction using a temporary override
    if (window.navigator && window.navigator.clipboard) {
        const originalWriteText = window.navigator.clipboard.writeText;
        window.navigator.clipboard.writeText = () => Promise.reject(new Error('Clipboard access is blocked'));
        
        // Restore the original writeText method after a short delay
        setTimeout(() => {
            window.navigator.clipboard.writeText = originalWriteText;
        }, 1000);
    }
}

// Add event listeners to block selection, copying, cutting, pasting, context menu, and dragging text
document.addEventListener('copy', handleRestrictedAction);
document.addEventListener('cut', handleRestrictedAction);
document.addEventListener('paste', handleRestrictedAction);
document.addEventListener('selectstart', handleRestrictedAction);
document.addEventListener('contextmenu', handleRestrictedAction);
document.addEventListener('dragstart', handleRestrictedAction);

// Block common keyboard shortcuts for copying or cutting (Ctrl+C, Ctrl+X, or Cmd+C, Cmd+X)
document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'x')) {
        e.preventDefault();
        showPopup(); // Show the pop-up if the user tries to use copy or cut shortcut
    }
});

// Block screenshot and screenshot shortcuts (e.g., PrintScreen, Command+Shift+3/4)
document.addEventListener('keydown', function(e) {
    // For Windows: Detect PrintScreen key
    if (e.key === 'PrintScreen') {
        showPopup();
    }

    // For Mac: Detect Command+Shift+3 and Command+Shift+4
    if ((e.metaKey && e.shiftKey && e.key === '3') || (e.metaKey && e.shiftKey && e.key === '4')) {
        alert('Screenshots are not allowed!');
    }
});

// Function to check if the user is on 'github.infra.cloudera.com'
function isClouderaGithub() {
    return window.location.host === 'github.infra.cloudera.com';
}

// Add restriction only on 'github.infra.cloudera.com'
if (isClouderaGithub()) {
    document.addEventListener('keydown', function(e) {
        // Block screenshot actions only on the specific Cloudera domain
        if (e.key === 'PrintScreen' || ((e.metaKey && e.shiftKey && e.key === '3') || (e.metaKey && e.shiftKey && e.key === '4'))) {
            showPopup();
        }
    });
}

// Function to observe and attach event listeners to the copy button
function observeCopyButton() {
    // Ensure the body element is available
    if (document.body) {
        const observer = new MutationObserver(() => {
            const copyButton = document.evaluate('//*[@class="d-inline-block btn-octicon"]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            if (copyButton) {
                copyButton.removeEventListener('click', handleCopyButtonClick); // Remove any existing listener
                copyButton.addEventListener('click', handleCopyButtonClick);
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
    } else {
        // Retry observing after a short delay if body is not yet available
        setTimeout(observeCopyButton, 100);
    }
}

// Start observing
observeCopyButton();
