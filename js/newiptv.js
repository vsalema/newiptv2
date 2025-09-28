// JavaScript Document
const sourceSelectx1 = document.getElementById("sourceSelectx1");
    const m3uLinkx1Input = document.getElementById("m3uLinkx1");
    const channelLinkx1Input = document.getElementById("channelLinkx1");
    const categorySelectx1 = document.getElementById("categorySelectx1");
    const channelSelectx1 = document.getElementById("channelSelectx1");
    const channelLogo = document.getElementById("channelLogo");
    const channelLogo2 = document.getElementById("channelLogo2");
    const fileInputx1 = document.getElementById("fileInputx1");
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
    sourceSelectx1.addEventListener("change", () => {
      const selectedValue = sourceSelectx1.value;
      if (selectedValue === "custom") {
        m3uLinkx1Input.style.display = "block";
      } else {
        m3uLinkx1Input.style.display = "none";
        m3uLinkx1Input.value = selectedValue;
        fetchM3U();
      }
    });
    m3uLinkx1Input.addEventListener("input", fetchM3U);
    categorySelectx1.addEventListener("change", () => {
      updatechannelSelectx1();
    });
    channelSelectx1.addEventListener("change", () => {
      updatechannelLinkx1Input();
      playChannel();
    });
    fileInputx1.addEventListener("change", handleFileUpload);

    function fetchM3U() {
      clearData();
      const m3uLinkx1 = m3uLinkx1Input.value;
      if (m3uLinkx1) {
        fetch(m3uLinkx1)
          .then(response => response.text())
          .then(content => {
            data = content;
            channels = parseM3U(data);
            const categories = Array.from(new Set(channels.map(channel => channel.category)));
            categories.forEach(category => {
              const option = document.createElement("option");
              option.value = category;
              option.textContent = `${category} (${countChannelsInCategory(category)})`;
              categorySelectx1.appendChild(option);
            });
            updatechannelSelectx1();
          });
      }
    }

    function updatechannelSelectx1() {
      const selectedCategory = categorySelectx1.value;
      channelSelectx1.innerHTML = "";
      channels.filter(channel => channel.category === selectedCategory).forEach(channel => {
        const option = document.createElement("option");
        option.value = channel.url;
        option.textContent = channel.name;
        channelSelectx1.appendChild(option);
      });
      updatechannelLinkx1Input();
      playChannel();
    }

    function updatechannelLinkx1Input() {
      channelLinkx1Input.value = channelSelectx1.value;
    }

    function clearData() {
      data = "";
      channels = [];
      channelLogo2.src = "";
      categorySelectx1.innerHTML = "";
      channelSelectx1.innerHTML = "";
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
            categorySelectx1.appendChild(option);
          });
          updatechannelSelectx1();
        };
        reader.readAsText(file);
      }
    }

    function playChannel() {
      const selectedChannelUrl = channelLinkx1Input.value; // Lấy liên kết từ channelLinkx1Input
      // Cập nhật trình phát video
      videoPlayer.src({
        src: selectedChannelUrl,
        type: ""
      });
      // Lấy kênh đã chọn từ channelSelectx1
      const selectedChannel = channels.find(channel => channel.url === channelSelectx1.value);
      // Cập nhật logo kênh từ kênh đã chọn
      if (selectedChannel) {
        channelLogo.src = selectedChannel.logo;
     channelLogo2.src = selectedChannel.logo;
      } else {
        channelLogo.src = "";
      channelLogo2.src = "";
      }
    }
    





channelLinkx1Input.addEventListener("input", () => {
      playChannel();
    });
    // Tự động chọn nguồn đầu tiên và fetch dữ liệu khi mở trang
    sourceSelectx1.selectedIndex = 0;
    sourceSelectx1.dispatchEvent(new Event("change"));
