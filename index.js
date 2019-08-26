(async function($) {
  let role = null;
  let roleId = 0;
  let race = '';
  let inputValue = {
    info: '訊息顯示',
    eat: '吃',
    fight: '戰鬥'
  };
  const form = $('#infoForm');
  const showDiv = $('#infoShow');
  const messageBtn = $('#message');

  let changeView = function() {
    if (role) {
      form.hide();
      showDiv.show();
    } else {
      form.show();
      showDiv.hide();
    }
  };

  let infoShow = function() {
    if (role) {
      let info = role.info();
      showDiv.html('');
      let htmlView = `<p>${info}</p>`;
      for (let key in role) {
        htmlView += `<input type="button" value="${inputValue[key]}" id="${key}" class="btn"/> `;
      }
      htmlView += '<br>';
      htmlView += '<input type="button" value="保存角色" id="save" class="btn"/> ';
      if (roleId !== 0) {
        htmlView += '<input type="button" value="刪除角色" id="delete" class="btn"/> ';
      }
      htmlView += `<input type="button" value="建新角色" id="reset" class="btn"/>`;

      showDiv.append(htmlView);
      console.log(info);
    }
  };

  let submitHandle = async function(e) {
    e.preventDefault();
    const input = $(this).serializeArray();
    let name = input[0].value.trim();
    let sex = input[1].value;
    race = input[2].value;

    if (name && sex && race) {
      let res = readRoleName(name).fail(err => console.log(`讀取角色資料錯誤:${err}`));
      await res;
      roleData = res.responseJSON[0] || '';
      if (roleData) {
        if (roleData.character === 'admin') {
          alert('無權創建此名字角色!!');
          $('#inputName').val('');
        } else {
          roleId = roleData.id;
          let { sex, race, exp, life } = roleData;
          role = await creatCreature(name, sex, race, exp, life);
        }
      } else {
        role = await creatCreature(name, sex, race);
      }
    } else {
      alert('請輸入名字!!');
    }
    infoShow();
    changeView();
  };

  let resetHandle = function() {
    role = null;
    roleId = 0;
    race = '';
    changeView();
  };

  let eatHandle = function() {
    role = role.eat();
    infoShow();
  };

  let fightHandle = function() {
    let fight = role.fight();
    if (typeof fight === 'string') {
      alert(fight);
    } else {
      role = fight;
      infoShow();
    }
  };

  let saveHandle = function() {
    let roleData = {
      name: role.name,
      sex: role.sex * 1,
      exp: role.exp * 1,
      life: role.life * 1,
      race
    };
    if (roleId !== 0) {
      roleData.id = roleId * 1;
    }
    saveAndUpdateRoleData(roleData)
      .then(res => {
      console.log(res);
      roleId = res.id;
      infoShow();
    })
      .catch(err => {
      console.log(err.statusText);
    });
  };

  let deleteHandle = function() {
    if (roleId !== 0) {
      deleteRoleId(roleId)
        .then(res => {
        console.log(res);
        resetHandle();
      })
        .catch(err => {
        console.log(err.statusText);
      });
    }
  };

  let inputHandle = function() {
    const { id, value } = this;
    if (value) {
      // if (window.confirm(`確定要${value}?`)) {
      switch (this.id) {
        case 'reset':
          if (window.confirm(`確定要創建其他角色?`)) {
            resetHandle();
          }
          break;
        case 'eat':
          eatHandle();
          break;
        case 'fight':
          fightHandle();
          break;
        case 'info':
          infoShow();
          break;
        case 'delete':
          if (window.confirm(`確定要刪除角色?`)) {
            deleteHandle();
          }
          break;
        case 'save':
          saveHandle();
          break;
      }
      // }
    }
  };

  let goMessageHandle = function() {
    window.location.href = urls.messagePage;
  };

  let init = function() {
    form.on('submit', submitHandle);
    showDiv.on('click', '>input', inputHandle);
    messageBtn.on('click', goMessageHandle);
  };
  init();
})($);