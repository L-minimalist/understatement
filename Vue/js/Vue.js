//创建一个Vue类
class Vue {
	//构造器
	constructor(obj) {
		//保存重要属性
		this.$el = obj.el;
		this.$data = obj.data;
		
		//判断视图是否存在
		if (this.$el) {
			//创建模板编译器，来解析视图
			this.$template = new Template(this.$el, this);
		}
	}
}
