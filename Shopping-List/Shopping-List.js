     function addItem() {
            var itemText = document.getElementById("itemInput").value;
            if (itemText === "") {
                alert("Please enter an item!");
                return;
            }
            var li = document.createElement("li");
            li.textContent = itemText;
            var removeBtn = document.createElement("span");
            removeBtn.textContent = "❌";
            removeBtn.onclick = function() {
                li.remove();
            };
            li.appendChild(removeBtn);
            document.getElementById("list").appendChild(li);
            document.getElementById("itemInput").value = "";
        }
