//创建一个模板编译器
class Template {
	//构造器
	constructor(el, vm) {
		//保存重要属性
		this.el = el;
		this.el = this.isElementNode(this.el) ? this.el : document.querySelector(this.el);
		this.vm = vm;
		//判断视图是否存在
		if (this.el) {
			//1. 把模板内容放入内存
			const fragment = this.nodeFragment(this.el);
			//2. 解析模板
			this.compile(fragment);
			//3. 把内存的结果返回到页面中
			this.el.appendChild(fragment);
		}
	}
	
	isElementNode(node) {
		return node.nodeType === 1;
	}
	
	isTextNode(node) {
		return node.nodeType === 3;
	}
	
	isDirective(attrName) {
		return attrName.includes('v-');
	}
	
	//把模板内容放入内存,等待解析
	nodeFragment(node) {
		//1. 创建内存片段
		const fragment = document.createDocumentFragment();
		let child = {};
		//2. 把模板内容放入内存
		while (child = this.el.firstChild) {
			fragment.appendChild(child);
		}
		//3. 返回
		return fragment;
	}
	
	//解析模板
	compile(parent) {
		//1. 获取子节点
		let childNodes = parent.childNodes;
		//2. 遍历每一个子节点
		[...childNodes].forEach(item => {
			//3. 判断节点类型
			if (this.isElementNode(item)) {
				//元素节点
				this.compileElement(item);
			} else {
				//文本节点
				//定义文本验证规则
				const textReg = /\{\{(.+)\}\}/;
				const text = item.textContent;
				
				if (textReg.test(text)) {
					this.compileText(item, this.vm, RegExp.$1);
				}
			}
		});
	}
	
	//解析元素引擎
	compileElement(el) {
		//1. 获取当前元素所有的属性
		let attrs = el.attributes;
		//2. 遍历当前元素所有的属性
		[...attrs].forEach(item => {
			//保存属性名
			let attrName = item.name;
			//3. 判断是否是指令
			if (this.isDirective(attrName)) {
				//4. 指令类型
				let type = attrName.substr(2);
				//保存属性的值(表达式)
				let expr = item.value;
				
				CompilerUtils[type](el, this.vm, expr)
			}
		});
		
	}
	
	//解析文本引擎
	compileText(node, vm, expr) {
		CompilerUtils.text(node, vm, expr);
	}
}

//解析指令工具类
CompilerUtils = {
	//解析text指令
	text(node, vm, expr) {
		//找到更新方法
		let updaterFn = this.updater['textUpdater'];
		//执行更新方法
		updaterFn && updaterFn(node, vm.$data[expr]);
	},
	
	//解析model指令
	model(node, vm, expr) {
		//找到更新方法
		let updaterFn = this.updater['modelUpdater'];
		//执行更新方法
		updaterFn && updaterFn(node, vm.$data[expr]);
		
		//视图到模型
		node.addEventListener('input', e => {
			vm.$data[expr] = e.target.value;
		});
	},
	
	//更新规则对象
	updater: {
		//文本更新方法
		textUpdater(node, val) {
			node.textContent = val;
		},
		
		//输入框更新方法
		modelUpdater(node, val) {
			node.value = val;
		}
	}
}
