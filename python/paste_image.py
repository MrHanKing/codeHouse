#!/usr/bin/python
#-*-coding: utf-8-*-

from PIL import Image

# shixiong项目使用，合并分散的博物馆图片  9张合为1张合图

for x in range(53):
	base_image = Image.new('RGBA', (369, 542), (0, 0, 0, 0))
	for y in range(1,10):
		image_name = u'tu%s-%s.png' % (x, y)
		image_link = u'./import/%s' % image_name
		add_image = Image.open(ur'%s' % image_link)
		add_image = add_image.convert('RGBA')
		base_image.paste(add_image, (0,0), add_image)
	base_image.save("./tu%s.png" % x)