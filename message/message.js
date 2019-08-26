(async function($) {
  let nowRole = null;
  let roleList = [];
  let showMsgs = null;
  let nowMsg = null;

  let addZero = function(str = '', len = 0) {
    str += '';
    let strLen = str.length;
    if (len > 0 && strLen < len) {
      let needZeroLen = len - strLen;
      for (i = 0; i < needZeroLen; i++) {
        str = '0' + str;
      }
    }
    return str;
  };

  let nowTime = function() {
    let date = new Date();
    let year = addZero(date.getFullYear(), 4);
    let month = addZero(date.getMonth() + 1, 2);
    let day = addZero(date.getDate(), 2);
    let hour = addZero(date.getHours(), 2);
    let min = addZero(date.getMinutes(), 2);
    let sec = addZero(date.getSeconds(), 2);
    let time = `${year}-${month}-${day} ${hour}:${min}:${sec}`;
    return time;
  };

  let filterRoleData = function(role) {
    let { id, name, character } = role;
    return { id, name, character };
  };

  let getRole = async function(name) {
    let role = readRoleName(name).fail(err => console.log(err));
    await role;
    let tmpRole = role.responseJSON[0] || null;
    if (tmpRole) {
      nowRole = filterRoleData(tmpRole);
    }
  };

  let goCreature = function() {
    window.location.href = urls.creaturePage;
  };

  let inputRoleName = async function() {
    let inputOk = false;
    while (!inputOk) {
      let name = prompt('請輸入姓名');
      if (name) {
        await getRole(name.trim());
        if (nowRole) {
          inputOk = true;
          break;
        }
      }
      if (confirm('此角色不存在，是否要去創建角色?')) {
        goCreature();
        break;
      }
    }
    return inputOk;
  };

  let awayForEach = async function(arr, fun) {
    for (let i = 0; i < arr.length; i++) {
      await fun(arr[i], i, arr);
    }
  };

  let getData = async function() {
    let roles = readRoleName().fail(err => console.log(err));
    let msgs = readMsg().fail(err => console.log(err));
    await roles;
    await msgs;
    let roleTmpList = roles.responseJSON || [];
    await awayForEach(roleTmpList, role => {
      roleList.push(filterRoleData(role));
    });
    showMsgs = msgs.responseJSON || [];
  };

  let addBtnEvent = function(btn, handle) {
    btn
      .filter((i, e) => i % 2 === 0)
      .addClass('delete')
      .end()
      .filter((i, e) => i % 2 === 1)
      .addClass('edit')
      .end()
      .on('click', handle);
  };

  let removeBtnEvent = function(btn, handle) {
    btn
      .off('click', handle)
      .end()
      .find('.edit')
      .removeClass('edit')
      .end()
      .find('.delete')
      .removeClass('delete');
  };

  let deleteChoiceMsg = async function(thisMessage) {
    let deleteOk = false;
    if (confirm('確定要刪除這則留言?')) {
      let messageId = thisMessage.attr('id') ? thisMessage.attr('id').substring(4) * 1 : 0;
      let othMessageBtn = thisMessage.siblings().find('.contentbtn');
      if (messageId !== 0) {
        let result = deleteMsg(messageId).fail(err => console.log(err));
        await result;
        thisMessage.remove();
        if (othMessageBtn.length === 0) {
          $('#box').removeClass('box');
        }
        let showArryMsg = showMsgs.filter(msg => msg.id == messageId);
        if (showArryMsg) {
          let deleteMsgIndex = showMsgs.indexOf(showArryMsg[0]);
          if (deleteMsgIndex > -1) {
            showMsgs.splice(deleteMsgIndex, 1);
          }
        }
        deleteOk = true;
      }
    }
    return deleteOk;
  };

  let saveChoiceMsg = async function(content, messageId) {
    if (nowMsg !== content) {
      let updateTime = nowTime();
      let data = {
        content,
        updateTime
      };
      if (messageId !== 0) {
        data.id = messageId;
      }
      let result = saveAndUpdateMsg(data).fail(err => console.log(err));
      await result;
      let showArryMsg = showMsgs.filter(msg => msg.id == messageId);
      if (showArryMsg) {
        showArryMsg[0].content = content;
        showArryMsg[0].updateTime = updateTime;
      }
    }
    return true;
  };

  let contentbtnHandle = async function() {
    let nowBtn = $(this);
    let textContent = nowBtn
    .parent()
    .children()
    .last();
    let thisMessage = nowBtn.parent().parent();
    let messageId = thisMessage.attr('id') ? thisMessage.attr('id').substring(4) * 1 : 0;

    let othMessageBtn = thisMessage.siblings().find('.contentbtn');

    let className = nowBtn.attr('class');
    let isDelete = className.indexOf('delete') > 0;

    if (nowMsg) {
      // 編輯狀態
      let editOk = false;
      if (isDelete) {
        textContent.text(nowMsg);
        editOk = true;
      } else {
        let content = textContent.text();
        if (content) {
          editOk = await saveChoiceMsg(content, messageId);
        } else {
          editOk = await deleteChoiceMsg(thisMessage);
        }
      }
      if (editOk) {
        nowMsg = null;
        textContent.prop('contenteditable', false);
        textContent.removeClass('editContent').addClass('pContent');
        renderView();
        addBtnEvent($('.contentbtn'), contentbtnHandle);
      }
    } else {
      if (isDelete) {
        let deleteResult = await deleteChoiceMsg(thisMessage);
        if (deleteResult) {
          renderView();
          addBtnEvent($('.contentbtn'), contentbtnHandle);
        }
      } else {
        nowMsg = textContent.text();
        textContent.prop('contenteditable', true);
        textContent.removeClass('pContent').addClass('editContent');
        nowBtn.removeClass('edit').addClass('check');
        removeBtnEvent(othMessageBtn, contentbtnHandle);
      }
    }
  };

  let renderSelect = function() {
    let isAdmin = nowRole.character === 'admin';
    let option = '';
    if (isAdmin) {
      roleList.forEach(role => {
        let selected = role.id == nowRole.id ? 'selected' : '';
        option += `<option value="${role.id}" ${selected}>${role.name}</option>`;
      });
    } else {
      option = `<option value="${nowRole.id}">${nowRole.name}</option>`;
    }
    $('#selectUser')
      .empty()
      .append(option);
  };

  let renderView = function() {
    let boxMsg = '';
    let isAdmin = nowRole.character === 'admin';
    if (showMsgs !== null && showMsgs.length > 0) {
      showMsgs.forEach((msg, key) => {
        let msgClass = key % 2 === 0 ? 'msgleft' : 'msgright';
        let thisUser = roleList.filter(r => r.id == msg.userId);
        let userName = thisUser && thisUser.length > 0 ? thisUser[0].name : 'NoName';
        let canEdit = isAdmin || userName === nowRole.name;
        let contentBtn = '<div class="contentbtn delete"></div><div class="contentbtn edit"></div>';
        let content = canEdit ? contentBtn : '';
        let time = `Send:${msg.sendTime}` + (msg.updateTime ? `/ Update:${msg.updateTime}` : '');
        boxMsg += `<div class="${msgClass}" id="msg_${msg.id}">
                  <div class="user">${userName}</div>
                  <div class="content">
                  ${content}
                  <p class="pContent">${msg.content}</p>
                  </div>
                  <div class="timeZone">
                  <p>${time}</p>
                  </div>
                  </div>`;
      });

      $('#box')
        .empty()
        .append(boxMsg)
        .addClass('box');
    } else {
      $('#box')
        .empty()
        .removeClass('box');
    }
  };
  let saveHandle = async function(e) {
    e.preventDefault();
    const input = $(this).serializeArray();
    let userId = input[0].value;
    let content = input[1].value.trim();
    let sendTime = nowTime();
    if (userId) {
      if (content) {
        let data = {
          content,
          userId,
          sendTime
        };

        let result = saveAndUpdateMsg(data).fail(err => console.log(err));
        await result;
        let saveData = result.responseJSON || null;
        if (saveData) {
          showMsgs.unshift(saveData);
        }
        $('.inputContent').val('');
        renderView();
        addBtnEvent($('.contentbtn'), contentbtnHandle);
      } else {
        alert('請輸入留言內容');
      }
    } else {
      alert('請選擇留言角色');
    }
  };

  let init = async function() {
    let inputOk = await inputRoleName();
    if (inputOk) {
      await getData();
      renderSelect();
      renderView();
      addBtnEvent($('.contentbtn'), contentbtnHandle);
      $('#msgForm').on('submit', saveHandle);
      $('#creature').on('click', goCreature);
    }
  };

  init();
})($);