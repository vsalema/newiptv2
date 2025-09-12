// JavaScript Document
const sourceSelect = document.getElementById("sourceSelect");
    const m3uLinkInput = document.getElementById("m3uLink");
    const channelLinkInput = document.getElementById("channelLink");
    const categorySelect = document.getElementById("categorySelect");
    const channelSelect = document.getElementById("channelSelect");
    const channelLogo = document.getElementById("channelLogo");
    const channelLogo2 = document.getElementById("channelLogo2");
    const fileInput = document.getElementById("fileInput");
    const videoPlayer = videojs("player");
    let data = "";
    let channels = [];
    const parseM3U = (m3uContent) => {
      const lines = m3uContent.split("\n");
      let currentChannel = {};
      let currentCategory = "";
      lines.forEach(line => {
        if (line.startsWith("#EXTGRP:")) {
          currentCategory = line.split(":")[1];
        } else if (line.startsWith("#EXTINF:")) {
          currentChannel = {};
          const lastCommaIndex = line.lastIndexOf(",");
          currentChannel.name = line.slice(lastCommaIndex + 1);
          const groupTitleMatch = line.match(/group-title="([^"]*)"/);
          const logoMatch = line.match(/tvg-logo="([^"]*)"/);
          
         
          
          if (groupTitleMatch) {
            currentChannel.category = groupTitleMatch[1];
          } else {
            currentChannel.category = currentCategory || "Unknown";
          }
          currentChannel.logo = logoMatch ? logoMatch[1] : "";
        } else if (line.startsWith("http")) {
          currentChannel.url = line;
          channels.push(currentChannel);
        }
      });
      return channels;
    };
    sourceSelect.addEventListener("change", () => {
      const selectedValue = sourceSelect.value;
      if (selectedValue === "custom") {
        m3uLinkInput.style.display = "block";
      } else {
        m3uLinkInput.style.display = "none";
        m3uLinkInput.value = selectedValue;
        fetchM3U();
      }
    });
    m3uLinkInput.addEventListener("input", fetchM3U);
    categorySelect.addEventListener("change", () => {
      updateChannelSelect();
    });
    channelSelect.addEventListener("change", () => {
      updateChannelLinkInput();
      playChannel();
    });
    fileInput.addEventListener("change", handleFileUpload);

    function fetchM3U() {
      clearData();
      const m3uLink = m3uLinkInput.value;
      if (m3uLink) {
        fetch(m3uLink)
          .then(response => response.text())
          .then(content => {
            data = content;
            channels = parseM3U(data);
            const categories = Array.from(new Set(channels.map(channel => channel.category)));
            categories.forEach(category => {
              const option = document.createElement("option");
              option.value = category;
              option.textContent = `${category} (${countChannelsInCategory(category)})`;
              categorySelect.appendChild(option);
            });
            updateChannelSelect();
          });
      }
    }

    function updateChannelSelect() {
      const selectedCategory = categorySelect.value;
      channelSelect.innerHTML = "";
      channels.filter(channel => channel.category === selectedCategory).forEach(channel => {
        const option = document.createElement("option");
        option.value = channel.url;
        option.textContent = channel.name;
        channelSelect.appendChild(option);
      });
      updateChannelLinkInput();
      playChannel();
    }

    function updateChannelLinkInput() {
      channelLinkInput.value = channelSelect.value;
    }

    function clearData() {
      data = "";
      channels = [];
      channelLogo2.src = "";
      categorySelect.innerHTML = "";
      channelSelect.innerHTML = "";
      channelLogo.src = "";
      
    }

    function countChannelsInCategory(category) {
      return channels.filter(channel => channel.category === category).length;
    }

    function handleFileUpload(event) {
      clearData();
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
          const content = e.target.result;
          data = content;
          channels = parseM3U(data);
          const categories = Array.from(new Set(channels.map(channel => channel.category)));
          categories.forEach(category => {
            const option = document.createElement("option");
            option.value = category;
            option.textContent = `${category} (${countChannelsInCategory(category)})`;
            categorySelect.appendChild(option);
          });
          updateChannelSelect();
        };
        reader.readAsText(file);
      }
    }

    function playChannel() {
      const selectedChannelUrl = channelLinkInput.value; // Lấy liên kết từ channelLinkInput
      // Cập nhật trình phát video
      videoPlayer.src({
        src: selectedChannelUrl,
        type: ""
      });
      // Lấy kênh đã chọn từ channelSelect
      const selectedChannel = channels.find(channel => channel.url === channelSelect.value);
      // Cập nhật logo kênh từ kênh đã chọn
      if (selectedChannel) {
        channelLogo.src = selectedChannel.logo;
     channelLogo2.src = selectedChannel.logo;
      } else {
        channelLogo.src = "";
      channelLogo2.src = "";
      }
    }
    





channelLinkInput.addEventListener("input", () => {
      playChannel();
    });
    // Tự động chọn nguồn đầu tiên và fetch dữ liệu khi mở trang
    sourceSelect.selectedIndex = 0;
    sourceSelect.dispatchEvent(new Event("change"));

