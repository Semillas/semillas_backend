# -*- coding: utf-8 -*-
# Generated by Django 1.9.7 on 2016-10-01 17:25
from __future__ import unicode_literals

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import services.models


class Migration(migrations.Migration):

    dependencies = [
        ('services', '0002_auto_20160928_1921'),
    ]

    operations = [
        migrations.CreateModel(
            name='ServicePhoto',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('photo', models.FileField(blank=True, default=None, help_text='Photos of the service being offered', max_length=300, null=True, upload_to=services.models.ServicePhoto.service_photo_upload)),
            ],
        ),
        migrations.AlterField(
            model_name='service',
            name='author',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='services', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='servicephoto',
            name='service',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='photos', to='services.Service'),
        ),
    ]
