Atomic operation instruction set extension for logical operation memory in [Mindustry]

Using this mod can avoid the overhead of simulating atomic operations using frame synchronization, which averages around 15 line times

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
| lock | `rwlock(m, n, i)`       |


Complex Commands
-------------------------------------------------------------------------------
- **rwlock(stat, mut, block)**:
  - **block**: Enable block polling until locked (change `@counter`)
  - **mut**: Acquire write lock (default is read lock)
  - **result**: Guard value, please subtract the value of guard when releasing the lock

    **Guard value by zero is acquire lock failed**


Basic Usage Examples
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


Simple Mutex Examples
-------------------------------------------------------------------------------

`lock` can also be used, which is more simple and supports multiple read locks

- `m == 0` is released
- `m == 1` is acquired

copy to multi processors

```
# wait to start
waitlink:
    # init
    write 0 cell1 0 # lock flag
    write 0 cell1 1 # draw col
    draw clear 0 0 0 0 0 0
    drawflush display1

    sensor start switch1 @enabled
jump waitlink equal start 0

main:
    trylock:
        mematom stor guard cell1 0 1 0
    jump trylock notEqual guard 0
    # locked!

    read i cell1 1
    jump nostop lessThan i 176
        stop
    nostop:

    # head draw (red)
    draw color 0xff 0 0 0 0 0
    draw rect i 0 1 30 0 0
    op add i i 2

    # body draws (green)
    draw color 0 0xff 0 0 0 0
    draw rect i 0 1 30 0 0
    op add i i 2

    draw color 0 0xff 0 0 0 0
    draw rect i 0 1 30 0 0
    op add i i 2

    draw color 0 0xff 0 0 0 0
    draw rect i 0 1 30 0 0
    op add i i 2

    # tail draw (blue)
    draw color 0 0 0xff 0 0 0
    draw rect i 0 1 30 0 0
    op add i i 2

    drawflush display1

    write i cell1 1 # write draw col
    write 0 cell1 0 # release lock
jump main always 0 0
```
