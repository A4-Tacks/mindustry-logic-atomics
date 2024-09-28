/*
 * repo: https://github.com/A4-Tacks/mindustry-logic-atomics
 * license: MIT
 */

const is_operable_memory = (exec, mem) => (
  !(mem === null)
  && mem instanceof MemoryBlock.MemoryBuild
  && mem.team == exec.team);

const as_memory = (exec, mem, index) => {
  if (!is_operable_memory(exec, mem)) return undefined;

  let arr = mem.memory;
  if (index < 0 || index >= arr.length) return undefined;

  return arr;
};

const check_num = (mem, idx) => {
  let num = mem[idx];
  if (isFinite(num)) return;
  mem[idx] = 0;
};

const cvar = (exec, type, id, ext) => {
  if (typeof id === "number") {
    return ext === undefined ? exec[type](id) : exec[type](id, ext);
  }
  return ext === undefined ? id[type]() : id[type](ext);
};

const Double = java.lang.Double;
const LongMin = java.math.BigInteger('-9223372036854775808');
const LongMax = java.math.BigInteger( '9223372036854775807');
const DLongMin = Double.valueOf(LongMin);
const DLongMax = Double.valueOf(LongMax);

const boundLong = num => (
  num < DLongMin ? DLongMin :
  num > DLongMax ? DLongMax :
  Double(num)
);
const Long = num => {
  if (LongMin >= num) return LongMin;
  if (LongMax <= num) return LongMax;

  const bounded = boundLong(num);
  return java.math.BigInteger.valueOf(bounded);
};


const DEFAULT_RESULT = null;
const ARGS_COUNT = 2;
const OPTS_WIDTH = 90;
const NAME = "mematom";


const OPTIONS = {
  add: {
    args: {
      inc: ["1", "num"],
    },
    run(_exec, mem, index, args) {
      let {inc} = args;
      let old = mem[index];
      mem[index] += inc;
      return old;
    },
  },
  sub: {
    args: {
      dec: ["1", "num"],
    },
    run(_exec, mem, index, args) {
      let {dec} = args;
      let old = mem[index];
      mem[index] -= dec;
      return old;
    },
  },
  mul: {
    args: {
      num: ["1", "num"],
    },
    run(_exec, mem, index, args) {
      let {num} = args;
      let old = mem[index];
      mem[index] *= num;
      return old;
    },
  },
  abs: {
    args: {},
    run(_exec, mem, index, _args) {
      let old = mem[index];
      if (old < 0) {
        mem[index] = -old;
      }
      return old;
    },
  },
  max: {
    args: {
      num: ["1", "num"],
    },
    run(_exec, mem, index, args) {
      let {num} = args;
      let old = mem[index];
      if (num > old) mem[index] = num;
      return old;
    },
  },
  min: {
    args: {
      num: ["1", "num"],
    },
    run(_exec, mem, index, args) {
      let {num} = args;
      let old = mem[index];
      if (num < old) mem[index] = num;
      return old;
    },
  },
  and: {
    args: {
      num: ["1", "num"],
    },
    run(_exec, mem, index, args) {
      let {num} = args;
      let old = mem[index];
      mem[index] = boundLong(Long(old).and(Long(num)));
      return old;
    },
  },
  nand: {
    args: {
      num: ["1", "num"],
    },
    run(_exec, mem, index, args) {
      let {num} = args;
      let old = mem[index];
      mem[index] = boundLong(Long(old).andNot(Long(num)));
      return old;
    },
  },
  or: {
    args: {
      num: ["1", "num"],
    },
    run(_exec, mem, index, args) {
      let {num} = args;
      let old = mem[index];
      mem[index] = boundLong(Long(old).or(Long(num)));
      return old;
    },
  },
  xor: {
    args: {
      num: ["1", "num"],
    },
    run(_exec, mem, index, args) {
      let {num} = args;
      let old = mem[index];
      mem[index] = boundLong(Long(old).xor(Long(num)));
      return old;
    },
  },
  shl: {
    args: {
      num: ["1", "num"],
    },
    run(_exec, mem, index, args) {
      let {num} = args;
      let old = mem[index];
      mem[index] = boundLong(Long(old).shiftLeft(Long(num)));
      return old;
    },
  },
  shr: {
    args: {
      num: ["1", "num"],
    },
    run(_exec, mem, index, args) {
      let {num} = args;
      let old = mem[index];
      mem[index] = boundLong(Long(old).shiftRight(Long(num)));
      return old;
    },
  },
  flip: {
    args: {},
    run(_exec, mem, index, _args) {
      let old = mem[index];
      mem[index] = boundLong(Long(old).flipBit());
      return old;
    },
  },
  stor: {
    args: {
      num: ["1", "num"],
    },
    run(_exec, mem, index, args) {
      let {num} = args;
      let old = mem[index];
      mem[index] = num;
      return old;
    },
  },
  swpi: {
    args: {
      idx: ["0", "numi"],
    },
    run(_exec, mem, index, args) {
      let {idx} = args;
      let old = mem[index];
      mem[index] = mem[idx];
      mem[idx] = old;
      return old;
    },
  },
  swap: {
    args: {
      oth: ["cell2", "building"],
      '#': ["0", "numi"],
    },
    run(exec, mem, index, args) {
      let {oth, '#': idx} = args;
      let other_mem = as_memory(exec, oth, idx);
      if (other_mem === undefined) return undefined;

      let old = mem[index];
      mem[index] = other_mem[idx];
      other_mem[idx] = old;
      return old;
    },
  },
  lock: {
    args: {
      mut: ["0", "num"],
      block: ["1", "num"],
    },
    run(exec, mem, index, args) {
      let {mut, block} = args;
      let stat = mem[index];
      let guard = 0;

      if (!mut && stat >= 0) {
        guard = 1;
      } else if (mut && !stat) {
        guard = -1;
      }

      if (guard) {
        // acquired
        mem[index] += guard;
      } else if (block) {
        // poll
        exec.counter.numval -= 1;
      }
      return guard;
    },
  },
};
const OPTIONS_KEYS = Object.keys(OPTIONS);

const MemoryAtomicsI = {
  _(builder, op, result, mem, index, args) {
    this.op = op;
    const evals = {
      residx:   result,
      mem:      mem,
      index:    index,
    };

    for (let name in evals) {
      let raw = evals[name];
      let var_id = builder.var(raw);
      this[name] = var_id;
    }

    this.args = {};
    const params = (OPTIONS[op] || {}).args;
    if (!params) return;

    this.indices = {}; // Map<VarName,VarID>
    const argnames = Object.keys(params)
    for (let i in argnames) {
      this.indices[argnames[i]] = builder.var(args[i]);
    }
  },

  run(exec) {
    const op = OPTIONS[this.op];
    if (!op) return;

    for (let arg in op.args || {}) {
      let varType = op.args[arg][1];
      this.args[arg] = cvar(exec, varType, this.indices[arg]);
    }

    let mem, result;
    let index = cvar(exec, 'numi', this.index);
    let mem_building = cvar(exec, 'building', this.mem);
    if ((mem = as_memory(exec, mem_building, index)) !== undefined) {
      result = op.run(exec, mem, index, this.args); // running
      check_num(mem, index);
    }

    if (result === undefined)
      result = DEFAULT_RESULT;

    this.setResult(exec, result);
  },

  setResult(exec, obj) {
    const varType = (typeof obj == "number") ? "setnum" : "setobj";
    cvar(exec, varType, this.residx, obj);
  }
};

const MemoryAtomicsStatement = {
  new(words) {
    const st = extend(LStatement, Object.create(MemoryAtomicsStatement));
    st.read(words);
    return st;
  },

  read(words) {
    this.op = words[1] || "add";
    this.result = words[2] || "result";
    this.mem = words[3] || "cell1";
    this.index = words[4] || "0";

    let start = 5;
    this.args = new Array(ARGS_COUNT);
    for (let i = 0; i < ARGS_COUNT; ++i)
      this.args[i] = words[start + i] || "";
  },

  write(b) {
    b.append(NAME);

    b.append(" ");
    b.append(this.op);

    b.append(" ");
    b.append(this.result);

    b.append(" ");
    b.append(this.mem);

    b.append(" ");
    b.append(this.index);

    for (let arg of this.args) {
      b.append(" ");
      b.append(arg);
    }
  },

  build(h) {
    if (h instanceof Table) {
      return this.buildt(h);
    }

    const inst = extend(LExecutor.LInstruction, Object.create(MemoryAtomicsI));
    inst._(h, this.op, this.result, this.mem, this.index, this.args);
    return inst;
  },

  buildt(table) {
    const add = (name) => {
      table.field(this[name], Styles.nodeField, s => this[name] = s)
        .width(OPTS_WIDTH).left().color(table.color);
    };
    const sep = (str) => {
      table.add(str);
    };
    const row = () => {
      if (LCanvas.useRows())
        table.row();
    };

    table.clearChildren();
    table.left();

    add("result");
    row();

    sep("=");
    add("mem");
    sep("#");
    add("index");
    row();

    sep("fetch");

    var optb = table.button(this.op, Styles.logict, () => {
      this.showSelect(optb, OPTIONS_KEYS, this.op, op => {
        this.op = op;
        this.buildt(table);
      }, 4, c => {c.width(90)});
    }).width(80).color(table.color).get();

    if (!OPTIONS[this.op]) return;

    const arg_kvs = OPTIONS[this.op].args || {};
    const argnames = Object.keys(arg_kvs);
    for (let i in argnames) {
      let idx = i; // catch loop local variables
      if (!this.args[i]) {
        this.args[i] = arg_kvs[argnames[i]][0] || "";
      }

      sep(argnames[i]);
      this.field(table, this.args[i], arg => {this.args[idx] = arg}).
        width(OPTS_WIDTH).left();
      this.row(table);
    }
  },

  name: () => "Memory Atomics",
  color: () => Pal.logicIo,
  category: () => LCategory.io,
};

global.anuke.register(NAME, MemoryAtomicsStatement, [
  NAME, Object.keys(OPTIONS)[0], /* init default codes */
]);

module.exports = MemoryAtomicsStatement;
