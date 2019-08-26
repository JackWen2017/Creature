const creatCreature = async function(name, sex, race, exp, life) {
  let _race = race > 0 && race < 3 ? race : 1;

  const initExp = 100;
  const initLife = 20;
  let canWrite = false;

  Function.prototype.extend = function(parent) {
    this.prototype.__proto__ = parent.prototype;
  };

  const lvUpLoop = function(creature, lvName) {
    let { name, sex, life, exp } = creature;
    let instance = creature;
    let target = lvMap[lvName];
    if (target) {
      let maxExp = target.maxExp;
      if (maxExp !== -1 && exp >= maxExp) {
        let nextLvName = target.constructor.name;
        target = lvMap[nextLvName];
        instance = lvUpLoop(creature, nextLvName);
      } else if (creature.exp >= target.exp) {
        instance = new target.constructor(name, sex, life, exp);
      }
    }
    return instance;
  };

  const lvUp = function(creature, nowLvName) {
    let lvName = nowLvName || 'Creature';
    let instance = lvUpLoop(creature, lvName);
    // console.log(instance.info());
    return instance;
  };

  const change = function(creature, map) {
    if (creature instanceof Creature) {
      let { life, job, race } = creature;
      let exp = initExp;
      let hp = initLife;
      let maxLife = initLife;
      if (map) {
        exp = map.exp || exp;
        hp = map.life || hp;
        maxLife = map.maxLife || maxLife;
      }
      if (life <= 0 && hp <= 0) {
        return '沒有體力無法戰鬥';
      } else {
        canWrite = true;
        creature.exp += exp;
        creature.life += hp;
        if (life >= maxLife) life = maxLife;
        canWrite = false;
        let lvName = (job ? job : race)['key'];
        creature = lvUp(creature, lvName);
      }
    }
    return creature;
  };
  const Creature = function(name, sex, life, exp) {
    if (this instanceof Creature) {
      let _name = name || 'noName';
      let _sex = sex || 0;
      let _life = life || initLife;
      let _exp = exp || initExp;

      Object.defineProperties(this, {
        name: {
          configurable: false,
          get() {
            return _name;
          }
        },
        sex: {
          configurable: false,
          get() {
            return _sex;
          }
        },
        race: {
          configurable: false,
          writable: false,
          value: map[_race]['race']
        },
        life: {
          configurable: false,
          get() {
            return _life;
          },
          set(life) {
            if (canWrite) {
              _life = life;
            }
          }
        },
        exp: {
          configurable: false,
          get() {
            return _exp;
          },
          set(exp) {
            if (canWrite) {
              _exp = exp;
            }
          }
        }
      });
    } else {
      return new Creature(name, sex, life, exp);
    }
  };
  Creature.prototype.info = function() {
    let infoString = `姓名 : ${this.name}<br>
    性別 : ${this.sex == 0 ? '女' : '男'}<br>
    HP:${this.life}<br>
    exp:${this.exp}<br>
    種族:${this.race['name']}<br>
    職業:${this.job ? this.job['jobName'] : '無'}`;
    // console.log(infoString);
    return infoString;
  };

  const creatureRace = function(name, sex, life, exp) {
    Creature.apply(this, arguments);
    let _eatMap = eatMap[this.race['key']];
    Object.defineProperties(this, {
      eatMap: {
        configurable: false,
        get() {
          return _eatMap;
        },
        set(eatMap) {
          if (canWrite) {
            _eatMap = eatMap;
          }
        }
      }
    });
  };

  const People = function(name, sex, life, exp) {
    if (this instanceof People) {
      creatureRace.apply(this, arguments);
    } else {
      return new People(name, sex, life, exp);
    }
  };
  People.prototype.eat = function() {
    return change(this, this.eatMap);
  };
  People.extend(Creature);

  const Monster = function(name, sex, life, exp) {
    if (this instanceof Monster) {
      creatureRace.apply(this, arguments);
    } else {
      return new Monster(name, sex, life, exp);
    }
  };
  Monster.prototype.eat = function() {
    return change(this, this.eatMap);
  };
  Monster.extend(Creature);

  const creatureMap = {
    1: People,
    2: Monster
  };

  const Fighter = function(name, sex, life, exp) {
    if (this instanceof Fighter) {
      creatureMap[_race].apply(this, arguments);
      _job = map[0]['job']['fighter'];
      Object.defineProperties(this, {
        job: {
          configurable: false,
          get() {
            return _job;
          },
          set(job) {
            if (canWrite) {
              _job = job;
            }
          }
        },
        fightMap: {
          configurable: false,
          writable: false,
          value: fightMap[_job['key']]
        }
      });
    } else {
      return new Fighter(name, sex, life, exp);
    }
  };
  Fighter.prototype.fight = function() {
    return change(this, this.fightMap);
  };
  Fighter.extend(creatureMap[_race]);

  const fightRace = function(name, sex, life, exp) {
    Fighter.apply(this, arguments);
    canWrite = true;
    this.job = map[_race]['job']['fighter'];
    this.eatMap = eatMap[this.job['key']];
    canWrite = false;
  };

  const KindFighter = function(name, sex, life, exp) {
    if (this instanceof KindFighter) {
      fightRace.apply(this, arguments);
    } else {
      return new KindFighter(name, sex, life, exp);
    }
  };
  KindFighter.extend(Fighter);
  const CruelFighter = function(name, sex, life, exp) {
    if (this instanceof Fighter) {
      fightRace.apply(this, arguments);
    } else {
      return new CruelFighter(name, sex, life, exp);
    }
  };
  CruelFighter.extend(Fighter);

  const creatureFightMap = {
    1: KindFighter,
    2: CruelFighter
  };

  const lvMap = {
    Creature: {
      exp: 100,
      maxExp: 200,
      constructor: creatureMap[_race]
    },
    People: {
      exp: 200,
      maxExp: 300,
      constructor: Fighter
    },
    Monster: {
      exp: 200,
      maxExp: 300,
      constructor: Fighter
    },
    Fighter: {
      exp: 300,
      maxExp: -1,
      constructor: creatureFightMap[_race]
    }
  };

  if(map){
    await initData();
  }

  let ceature = new Creature(name, sex);
  if (exp && life) {
    canWrite = true;
    ceature.exp = exp * 1;
    ceature.life = life * 1;
    canWrite = false;
  }
  ceature = lvUp(ceature);
  return ceature;
};