# -*- coding:utf-8 -*-

from xml.dom import minidom
import sys
import os

def killChildElement(rootNode, element):
	if rootNode.getElementsByTagName(element):
		childrens = rootNode.getElementsByTagName(element)
		for children in childrens:
			children.parentNode.removeChild(children)

def killAttribute(element, attName):
	if element.hasAttribute(attName):
		element.removeAttribute(attName)

def createLabelBMFontFile_CNB(dom, parentNode, FONT_DIR_DEFAULT):
	LabelBMFontFile_CNB = dom.createElement("LabelBMFontFile_CNB")
	LabelBMFontFile_CNB.setAttribute("Type", "Normal")
	if FONT_DIR_DEFAULT == "fonts/youxiziti2.TTF":
		LabelBMFontFile_CNB.setAttribute("Path", "fonts/font20.fnt")
	else:
		LabelBMFontFile_CNB.setAttribute("Path", "fonts/font28.fnt")
	LabelBMFontFile_CNB.setAttribute("Plist", "")
	parentNode.appendChild(LabelBMFontFile_CNB)

def createfile(file_name):
	dom = minidom.parse(file_name)
	# 根节点
	root = dom.documentElement

	abstractNodeDatas = root.getElementsByTagName("AbstractNodeData")

	for abstractNodeData in abstractNodeDatas:
		# print "----" * 8
		if abstractNodeData.hasAttribute("ctype") and abstractNodeData.getAttribute("ctype") == "TextObjectData":
			# print "1----" * 8
			# print abstractNodeData.getAttribute("FontSize")
			# print "2----" * 8
			# 默认替换字体
			FONT_DIR_DEFAULT = "fonts/font20.fnt"
			# 删除属性
			killAttribute(abstractNodeData, "IsCustomSize")
			killAttribute(abstractNodeData, "FontSize")
			killAttribute(abstractNodeData, "HorizontalAlignmentType")
			killAttribute(abstractNodeData, "ShadowOffsetX")
			killAttribute(abstractNodeData, "ShadowOffsetY")
			killAttribute(abstractNodeData, "ShadowEnabled")
			killAttribute(abstractNodeData, "OutlineSize")
			killAttribute(abstractNodeData, "OutlineEnabled")

			abstractNodeData.setAttribute("ctype", "TextBMFontObjectData")

			len = abstractNodeData.getElementsByTagName("Children").length
			# print len
			# 删除子对象
			if abstractNodeData.getElementsByTagName("FontResource"):
				childrens = abstractNodeData.getElementsByTagName("FontResource")
				for children in childrens:
					FONT_DIR_DEFAULT = children.getAttribute("Path")
					# 增加子element
					createLabelBMFontFile_CNB(dom, children.parentNode, FONT_DIR_DEFAULT)
					children.parentNode.removeChild(children)
			killChildElement(abstractNodeData, "OutlineColor")
			killChildElement(abstractNodeData, "ShadowColor")
			# print abstractNodeData.removeAttribute("FontSize")
		# print abstractNodeData.childNodes[0]
		# print abstractNodeData.toxml()
	root.toxml()
	# print root.toxml()
	return dom

# createfile("try_font.csd")

def analysis_file_to_file(file_name, out_put_path):
	print "analysis " + file_name + " to " + out_put_path
	if os.path.exists(out_put_path) == False:
		dep_path = ""
		for path in os.path.split(out_put_path):
			if (dep_path == ""):
				dep_path = path
			else:
				dep_path += "/" + path

			if dep_path != "" and os.path.exists(dep_path) == False:
				os.mkdir(dep_path)

	o_f = os.path.splitext(os.path.split(file_name)[1])[0]
	# out put中创建csd文件
	c_f = os.path.join(out_put_path, o_f + ".csd")

	if file_name.endswith(".csd") == False or os.path.exists(file_name) == False:
		return

	dom = createfile(file_name)
	# print dom
	file_obj = open(c_f, "w")

	# writexml内部用Unicode编码 因此象汉字首先要转成Unicode
	import codecs
	writer = codecs.lookup('utf-8')[3](file_obj)
	dom.writexml(writer, encoding='utf-8')
	# file_obj.writelines(doc)

	file_obj.close()

# 判断file_name下的.csd文件
def output_to_file(file_name, out_put_path):
	if file_name == "":
		print "not find file_name"
	elif os.path.isfile(file_name):
		analysis_file_to_file(file_name, out_put_path)
	elif os.path.isdir(file_name):
		for item in os.listdir(file_name):
			file = os.path.join(file_name, item)
			if (os.path.isfile(file) and file.endswith(".csd")):
				analysis_file_to_file(file, out_put_path)
	else:
		print "not find " + file_name

if __name__ == "__main__":

	file_name = ""

	is_to_file = False
	to_file_path = "out_put"

	i = 1
	while i < len(sys.argv):
		if (sys.argv[i] == "-d"):
			is_to_file = True
			if i + 1 < len(sys.argv):
				file_p = sys.argv[i + 1]
				if file_p.startswith("-") == False:
					to_file_path = file_p
					i += 1
		elif file_name == "" and sys.argv[i].startswith("-") == False:
			file_name = sys.argv[i]

		i += 1

	if file_name == "":
		file_name = sys.path[0]

	# print "is_to_file = " + str(is_to_file)
	# print "file_name = " + file_name
	# print "to_file_path = " + to_file_path

	if (is_to_file):
		output_to_file(os.path.abspath(file_name), os.path.abspath(to_file_path))
	else:
		print "this is error"
