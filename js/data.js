let isLocal = true;
let hostName = isLocal ? 'http://localhost:3000' : 'https://my-json-server.typicode.com/JackWen2017/demo';
let map = {};
const eatMap = {
  People: {
    exp: 10,
    life: 5,
    maxLife: 100
  },
  Monster: {
    exp: 5,
    life: 10,
    maxLife: 100
  },
  KindFighter: {
    exp: 5,
    life: 10,
    maxLife: 200
  },
  CruelFighter: {
    exp: 0,
    life: 15,
    maxLife: 200
  }
};
const fightMap = {
  Fighter: {
    exp: 20,
    life: -20,
    maxLife: 150
  },
  KindFighter: {
    exp: 20,
    life: -10,
    maxLife: 200
  },
  CruelFighter: {
    exp: 25,
    life: -15,
    maxLife: 200
  }
};

const urls = {
  creatureMap: `${hostName}/creatureMap`,
  users: `${hostName}/users`,
  messages: `${hostName}/messages?_sort=sendTime&_order=desc`,
  message: `${hostName}/messages`,
  creaturePage: '/index.html',
  messagePage: '/message/index.html'
};

const initData = async function() {
  let creatureMaps = $.ajax({
    url: urls.creatureMap
  });
  await creatureMaps;
  map = creatureMaps.responseJSON || {
    0: {
      job: {
        fighter: {
          key: 'Fighter',
          jobName: '戰士'
        }
      }
    },
    1: {
      race: {
        key: 'People',
        name: '人類'
      },
      job: {
        fighter: {
          key: 'KindFighter',
          jobName: '聖戰士'
        }
      }
    },
    2: {
      race: {
        key: 'Monster',
        name: '獸人'
      },
      job: {
        fighter: {
          key: 'CruelFighter',
          jobName: '狂戰士'
        }
      }
    }
  };
};

const saveAndUpdateRoleData = function(data) {
  const id = data.id;
  let method = 'POST';
  let url = urls.users;
  if (id) {
    method = 'PATCH';
    url += `/${id}`;
  }
  let saveAndUpdateResult = $.ajax({
    url,
    method,
    data
  });
  return saveAndUpdateResult;
};

const readRoleName = function(roleName) {
  let url = roleName ? `${urls.users}?name=${roleName}` : urls.users;
  let role = $.ajax({
    url,
    method: 'GET'
  });
  return role;
};

const deleteRoleId = function(roleId) {
  return $.ajax({
    url: `${urls.users}/${roleId}`,
    method: 'DELETE'
  });
};

const readMsg = function() {
  return $.ajax({
    url: urls.messages,
    method: 'GET'
  });
};

const saveAndUpdateMsg = function(data) {
  const id = data.id;
  let method = 'POST';
  let url = urls.message;
  if (id) {
    method = 'PATCH';
    url += `/${id}`;
  }
  return $.ajax({
    url,
    method,
    data
  });
};

const deleteMsg = function(msgId) {
  return $.ajax({
    url: `${urls.message}/${msgId}`,
    method: 'DELETE'
  });
};