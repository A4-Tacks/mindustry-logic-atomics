Atomic operation instruction set extension for logical operation memory in [Mindustry]

[Mindustry]: https://github.com/Anuken/Mindustry

repo: <https://github.com/A4-Tacks/mindustry-logic-atomics>

Operations List
-------------------------------------------------------------------------------

Unless otherwise specified, return the value before the memory operation

- **mem**: Current memory
- **m**: Value before the memory operation
- **n**: The first argument
- **i**: Second argument

| Name | expr                    |
| ---  | ---                     |
| add  | `m += n`                |
| sub  | `m -= n`                |
| mul  | `m *= n`                |
| abs  | `m = abs(o)`            |
| max  | `m = max(m, n)`         |
| min  | `m = min(m, n)`         |
| and  | `m &= n`                |
| nand | `m = ~(m & n)`          |
| or   | `m `|= n                |
| xor  | `m ^= n`                |
| shl  | `m <<= n`               |
| shr  | `m >>= n`               |
| flip | `m = ~m`                |
| stor | `m = n`                 |
| swpi | `m, mem[n] = mem[n], m` |
| swap | `m, n[i] = n[i], m`     |


Examples
-------------------------------------------------------------------------------

```
write 3 cell1 0
mematom add old cell1 0 4 0
read changed cell1 0

print "old: "; print old
print ", changed: "; print changed
printflush message1
```

**outputs**:

```
old: 3, changed: 7
```
