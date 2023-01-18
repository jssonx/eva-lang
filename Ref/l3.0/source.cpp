int main(void) {
    int x = 15;
    return x + 10 - 5;
}

// a.out: a stands for assembly and assembly out
//"echo $?": 打印出上一个命令的退出状态。退出状态是一个整数，其中 0 表示命令成功，而非零值表示命令失败。它可以用来检查命令的执行结果，并作出相应的操作。
// objdump -d a.out
// objdump -D a.out
// gcc source.cpp -S: 输出文件的assembly output
// gcc source.cpp -S -O2 -o source.o.s: 输出O2优化过的文件的assembly output
// clang -S -emit-llvm -o source.ll source.cpp: 生成llvm ir