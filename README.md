# avalonjs.valid
avalonjs 的一个验证器

有3个自定义标签
* ms-val="vm.prop" 用于指定要验证的数据来源，vm的属性。
* ms-val-class-error（success） ="class:vm.prop" 如果 vm.prop不能通过验证（通过验证），输出class
* ms-val-display="vm.prop" 如果vm.prop 不能通过验证结果，那么就输出验证的信息

验证器
* 必须与 ms-val 在同一个 element里面，否则无法初始化. 
* val-required 就启动其中一个验证器。属性设置使用 val-requied-error="pls input value" 就可以设置属性，设置这个属性时候，val-required="" 就可以省略。
* 可以多个val共同使用

存在问题
以下这种形式无法实现
```html
 <div ms-val-class-error="error:list">
      <div ms-repeat='list'>
        <input ms-duplex='el.name' ms-val='el.name' val-requied-error='请输入XXX'/>
     </div>
 </div>
```

